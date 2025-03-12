
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useChat } from "../contexts/ChatContext";
import { User } from "../contexts/AuthContext";

interface UserSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSearch({ isOpen, onClose }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers, createChat } = useChat();
  
  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  // Handle user selection
  const handleUserSelect = async (userId: string) => {
    await createChat(userId);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>Find Users</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, email, or phone"
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          {isSearching ? (
            <div className="py-10 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            query.trim() ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">
                  Search for users by username, email, or phone number
                </p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                  
                  <Button size="sm" onClick={() => handleUserSelect(user.id)}>
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
