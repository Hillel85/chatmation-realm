
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth, User } from "./AuthContext";
import { toast } from "sonner";

// Message type definition
export type Message = {
  id: string;
  senderId: string;
  receiverId: string | null;
  groupId: string | null;
  content: string;
  timestamp: number;
  isImage?: boolean;
  read?: boolean;
};

// Chat type definition
export type Chat = {
  id: string;
  name: string | null;
  isGroup: boolean;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: number;
  avatar?: string;
};

// Chat context type
type ChatContextType = {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  sendMessage: (content: string, isImage?: boolean) => void;
  setActiveChat: (chat: Chat | null) => void;
  createChat: (userId: string) => Promise<void>;
  createGroupChat: (name: string, participantIds: string[]) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  loadMoreMessages: () => Promise<void>;
};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock data for demo purposes - to be replaced with Supabase
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "john@example.com",
    username: "john_doe",
    phone: "555-1234",
    avatar: "https://i.pravatar.cc/150?u=john",
  },
  {
    id: "2",
    email: "jane@example.com",
    username: "jane_doe",
    phone: "555-5678",
    avatar: "https://i.pravatar.cc/150?u=jane",
  },
  {
    id: "3",
    email: "alice@example.com",
    username: "alice_smith",
    phone: "555-9012",
    avatar: "https://i.pravatar.cc/150?u=alice",
  },
  {
    id: "4",
    email: "bob@example.com",
    username: "bob_johnson",
    phone: "555-3456",
    avatar: "https://i.pravatar.cc/150?u=bob",
  },
  {
    id: "5",
    email: "charlie@example.com",
    username: "charlie_brown",
    avatar: "https://i.pravatar.cc/150?u=charlie",
  },
];

// Sample messages
const generateMockMessages = (chatId: string, participants: string[]): Message[] => {
  const messages: Message[] = [];
  const count = 5 + Math.floor(Math.random() * 10);
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const isEven = i % 2 === 0;
    messages.push({
      id: `msg_${chatId}_${i}`,
      senderId: participants[isEven ? 0 : 1],
      receiverId: chatId.startsWith("group") ? null : participants[isEven ? 1 : 0],
      groupId: chatId.startsWith("group") ? chatId : null,
      content: `This is message #${i + 1} in this conversation.`,
      timestamp: now - (count - i) * 60000 - Math.random() * 10000,
      read: true,
    });
  }
  
  return messages;
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  
  // Initialize chats when user changes
  useEffect(() => {
    if (!user) {
      setChats([]);
      setActiveChat(null);
      setMessages([]);
      return;
    }
    
    // Create some mock chats
    const mockChats: Chat[] = [
      {
        id: "chat_1",
        name: null,
        isGroup: false,
        participantIds: [user.id, "1"],
        unreadCount: 2,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        avatar: "https://i.pravatar.cc/150?u=john",
      },
      {
        id: "chat_2",
        name: null,
        isGroup: false,
        participantIds: [user.id, "2"],
        unreadCount: 0,
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        avatar: "https://i.pravatar.cc/150?u=jane",
      },
      {
        id: "group_1",
        name: "Project Team",
        isGroup: true,
        participantIds: [user.id, "1", "2", "3"],
        unreadCount: 5,
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
      {
        id: "group_2",
        name: "Family",
        isGroup: true,
        participantIds: [user.id, "4", "5"],
        unreadCount: 0,
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
    ];
    
    // Generate mock messages for each chat
    const mockMessages: Record<string, Message[]> = {};
    mockChats.forEach(chat => {
      mockMessages[chat.id] = generateMockMessages(chat.id, chat.participantIds);
      
      // Set last message
      const lastMsg = mockMessages[chat.id][mockMessages[chat.id].length - 1];
      chat.lastMessage = lastMsg;
    });
    
    // Sort chats by latest message
    mockChats.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || a.createdAt;
      const timeB = b.lastMessage?.timestamp || b.createdAt;
      return timeB - timeA;
    });
    
    setChats(mockChats);
    setAllMessages(mockMessages);
  }, [user]);
  
  // Update messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      const chatMessages = allMessages[activeChat.id] || [];
      setMessages(chatMessages);
      
      // Mark messages as read
      if (activeChat.unreadCount > 0) {
        setChats(prev => 
          prev.map(chat => 
            chat.id === activeChat.id ? { ...chat, unreadCount: 0 } : chat
          )
        );
      }
    } else {
      setMessages([]);
    }
  }, [activeChat, allMessages]);
  
  // Send a message to the active chat
  const sendMessage = (content: string, isImage = false) => {
    if (!activeChat || !user) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      receiverId: activeChat.isGroup ? null : activeChat.participantIds.find(id => id !== user.id) || null,
      groupId: activeChat.isGroup ? activeChat.id : null,
      content,
      timestamp: Date.now(),
      isImage,
      read: false,
    };
    
    // Update messages state
    setMessages(prev => [...prev, newMessage]);
    
    // Update allMessages
    setAllMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage],
    }));
    
    // Update chat with last message
    setChats(prev => 
      prev.map(chat => 
        chat.id === activeChat.id 
          ? { 
              ...chat, 
              lastMessage: newMessage,
            } 
          : chat
      ).sort((a, b) => {
        const timeA = a.lastMessage?.timestamp || a.createdAt;
        const timeB = b.lastMessage?.timestamp || b.createdAt;
        return timeB - timeA;
      })
    );
    
    // TODO: Replace with actual Supabase implementation
    console.log("Message sent:", newMessage);
  };
  
  // Create a new chat with another user
  const createChat = async (userId: string) => {
    if (!user) return;
    
    // Check if chat already exists
    const existingChat = chats.find(chat => 
      !chat.isGroup && chat.participantIds.includes(userId)
    );
    
    if (existingChat) {
      setActiveChat(existingChat);
      return;
    }
    
    // Find the target user
    const targetUser = MOCK_USERS.find(u => u.id === userId);
    if (!targetUser) {
      toast.error("User not found");
      return;
    }
    
    // Create new chat
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      name: null,
      isGroup: false,
      participantIds: [user.id, userId],
      unreadCount: 0,
      createdAt: Date.now(),
      avatar: targetUser.avatar,
    };
    
    // Update chats state
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setAllMessages(prev => ({ ...prev, [newChat.id]: [] }));
    
    toast.success(`Chat with ${targetUser.username} created`);
  };
  
  // Create a new group chat
  const createGroupChat = async (name: string, participantIds: string[]) => {
    if (!user) return;
    
    // Add current user to participants if not already included
    if (!participantIds.includes(user.id)) {
      participantIds.unshift(user.id);
    }
    
    // Create new group chat
    const newChat: Chat = {
      id: `group_${Date.now()}`,
      name,
      isGroup: true,
      participantIds,
      unreadCount: 0,
      createdAt: Date.now(),
    };
    
    // Update chats state
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setAllMessages(prev => ({ ...prev, [newChat.id]: [] }));
    
    toast.success(`Group "${name}" created`);
  };
  
  // Search users
  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];
    
    // Filter users based on query (case insensitive)
    query = query.toLowerCase();
    return MOCK_USERS.filter(u => 
      u.id !== user?.id && (
        u.username.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) || 
        (u.phone && u.phone.includes(query))
      )
    );
  };
  
  // Load more messages
  const loadMoreMessages = async () => {
    // This would load older messages from the database
    // For the mockup, we'll just add a placeholder message
    if (!activeChat || !user) return Promise.resolve();
    
    await new Promise(r => setTimeout(r, 500));
    
    // In a real implementation, you would fetch older messages and add them to the beginning
    toast.info("No more messages to load");
    
    return Promise.resolve();
  };
  
  return (
    <ChatContext.Provider value={{ 
      chats, 
      activeChat, 
      messages, 
      sendMessage, 
      setActiveChat, 
      createChat, 
      createGroupChat, 
      searchUsers,
      loadMoreMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  
  return context;
};
