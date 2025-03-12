
import React, { useState } from "react";
import { Button } from "./ui/button";
import { 
  ChevronLeft, 
  LogOut, 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  UserPlus, 
  Users 
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useChat, Chat } from "../contexts/ChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import ThemeToggle from "./ThemeToggle";
import { ScrollArea } from "./ui/scroll-area";
import { format } from "date-fns";
import UserSearch from "./UserSearch";
import GroupChat from "./GroupChat";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

export default function ChatSidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const { user, signOut } = useAuth();
  const { chats, activeChat, setActiveChat } = useChat();
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  
  // Filter chats based on search term
  const filteredChats = searchTerm.trim() === "" 
    ? chats
    : chats.filter(chat => {
        const name = chat.name || 
          (chat.isGroup ? "Group Chat" : chat.participantIds.find(id => id !== user?.id));
          
        return name?.toLowerCase().includes(searchTerm.toLowerCase());
      });
  
  // Handle chat selection
  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
    onMobileClose?.();
  };
  
  // Get chat name
  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;
    
    if (!chat.isGroup && user) {
      // For direct chats, use the other user's ID as a placeholder
      // In a real app, you'd fetch the user's name from the database
      const otherId = chat.participantIds.find(id => id !== user.id) || "Unknown";
      return otherId === "1" ? "John Doe" : 
             otherId === "2" ? "Jane Doe" : 
             otherId === "3" ? "Alice Smith" : 
             otherId === "4" ? "Bob Johnson" : 
             otherId === "5" ? "Charlie Brown" : 
             "Unknown User";
    }
    
    return "Chat";
  };
  
  // Format timestamp as relative time or date
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, "h:mm a");
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return format(date, "EEEE");
    } else {
      return format(date, "MMM d");
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-secondary/50 dark:bg-secondary/20 border-r animate-slide-in">
      {/* Sidebar Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.username} />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user?.username || "User"}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {user?.email || "user@example.com"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <ThemeToggle />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <div className="space-y-4 py-4">
                <h3 className="text-lg font-medium">Settings</h3>
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <ThemeToggle />
                </div>
                <Button variant="destructive" onClick={signOut} className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onMobileClose}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* New Chat Buttons */}
      <div className="px-4 py-2 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => setShowUserSearch(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => setShowGroupChat(true)}
        >
          <Users className="mr-2 h-4 w-4" />
          New Group
        </Button>
      </div>
      
      {/* Chats List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`
                  chat-list-item relative
                  ${activeChat?.id === chat.id ? 'bg-accent' : ''}
                `}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar} alt={getChatName(chat)} />
                  <AvatarFallback>
                    {chat.isGroup ? 
                      <Users className="h-6 w-6" /> : 
                      getChatName(chat).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{getChatName(chat)}</span>
                    {chat.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage ? (
                      chat.lastMessage.isImage ? 
                        "📷 Image" : 
                        chat.lastMessage.content
                    ) : (
                      chat.isGroup ? 
                        `${chat.participantIds.length} members` : 
                        "Start chatting"
                    )}
                  </p>
                </div>
                
                {chat.unreadCount > 0 && (
                  <div className="notification-badge">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* New Chat Modal */}
      {showUserSearch && (
        <UserSearch 
          onClose={() => setShowUserSearch(false)} 
          isOpen={showUserSearch}
        />
      )}
      
      {/* New Group Modal */}
      {showGroupChat && (
        <GroupChat
          onClose={() => setShowGroupChat(false)}
          isOpen={showGroupChat}
        />
      )}
    </div>
  );
}
