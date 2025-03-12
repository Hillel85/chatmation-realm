
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Search, Users, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useChat } from "../contexts/ChatContext";
import { User } from "../contexts/AuthContext";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface GroupChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupChat({ isOpen, onClose }: GroupChatProps) {
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers, createGroupChat } = useChat();
  
  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      
      // Filter out already selected users
      const filteredResults = results.filter(
        result => !selectedUsers.some(user => user.id === result.id)
      );
      
      setSearchResults(filteredResults);
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
  }, [query, selectedUsers]);
  
  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u.id !== user.id));
    setQuery("");
  };
  
  // Handle user removal
  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };
  
  // Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    
    const participantIds = selectedUsers.map(user => user.id);
    await createGroupChat(groupName, participantIds);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Add Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedUsers.map(user => (
                <Badge 
                  key={user.id}
                  variant="secondary"
                  className="pl-2 flex items-center gap-1"
                >
                  {user.username}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0 ml-1" 
                    onClick={() => handleUserRemove(user.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Search Results */}
          {isSearching ? (
            <div className="py-6 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            query.trim() ? (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Search for users to add to the group
                </p>
              </div>
            )
          ) : (
            <div className="max-h-48 overflow-auto space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-all cursor-pointer"
                  onClick={() => handleUserSelect(user)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{user.username}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button 
            className="w-full" 
            disabled={!groupName.trim() || selectedUsers.length === 0}
            onClick={handleCreateGroup}
          >
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
