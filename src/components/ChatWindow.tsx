
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft, Image, Menu, MoreVertical, Send } from "lucide-react";
import { format } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";

type ChatWindowProps = {
  onMobileMenuToggle: () => void;
};

export default function ChatWindow({ onMobileMenuToggle }: ChatWindowProps) {
  const { activeChat, messages, sendMessage } = useChat();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (isScrolledToBottom && endOfMessagesRef.current) {
      setTimeout(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isScrolledToBottom]);
  
  // Handle scroll events to determine if we're at the bottom
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsScrolledToBottom(isAtBottom);
  };
  
  // Handle sending messages
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    sendMessage(messageInput);
    setMessageInput("");
    setIsScrolledToBottom(true);
  };
  
  // Handle pressing Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Get chat name
  const getChatName = () => {
    if (!activeChat) return "";
    
    if (activeChat.name) return activeChat.name;
    
    if (!activeChat.isGroup && user) {
      // For direct chats, use the other user's ID as a placeholder
      const otherId = activeChat.participantIds.find(id => id !== user.id) || "Unknown";
      return otherId === "1" ? "John Doe" : 
             otherId === "2" ? "Jane Doe" : 
             otherId === "3" ? "Alice Smith" : 
             otherId === "4" ? "Bob Johnson" : 
             otherId === "5" ? "Charlie Brown" : 
             "Unknown User";
    }
    
    return "Chat";
  };
  
  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, typeof messages>>((groups, message) => {
    const date = format(new Date(message.timestamp), "MMMM d, yyyy");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  // Format time for messages
  const formatMessageTime = (timestamp: number) => {
    return format(new Date(timestamp), "h:mm a");
  };
  
  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center bg-background animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center animate-pulse-slow">
            <Send className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Select a chat to start messaging</h2>
          <p className="text-muted-foreground">
            Choose an existing conversation or start a new one
          </p>
          <Button 
            variant="outline" 
            onClick={onMobileMenuToggle}
            className="lg:hidden"
          >
            <Menu className="mr-2 h-4 w-4" />
            Show Conversations
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-background animate-fade-in">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={onMobileMenuToggle}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={activeChat.avatar} alt={getChatName()} />
            <AvatarFallback>{getChatName().charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-medium">{getChatName()}</div>
            <div className="text-xs text-muted-foreground">
              {activeChat.isGroup 
                ? `${activeChat.participantIds.length} members` 
                : "Online"}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Search messages</DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Clear chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Messages */}
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollAreaRef} 
        onScroll={handleScroll}
      >
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-xs text-muted-foreground">
                    {date}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {dateMessages.map((message) => {
                  const isSent = message.senderId === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] flex flex-col ${isSent ? "items-end" : "items-start"}`}>
                        <div className={isSent ? "message-sent" : "message-received"}>
                          {message.isImage ? (
                            <img
                              src={message.content}
                              alt="Shared content"
                              className="rounded-md max-h-64 object-contain"
                            />
                          ) : (
                            <p>{message.content}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatMessageTime(message.timestamp)}
                          {isSent && (message.read ? " • Read" : " • Sent")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
      </ScrollArea>
      
      {/* Message Input */}
      <div className="p-4 border-t bg-card flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Image className="h-5 w-5" />
        </Button>
        
        <Input
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        
        <Button 
          onClick={handleSendMessage} 
          disabled={!messageInput.trim()}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
