
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

// User type definition
export type User = {
  id: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
};

// Auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, phone?: string) => Promise<void>;
  signOut: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser");
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("chatUser");
      }
    }
    
    setIsLoading(false);
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 800));
      
      // Find user (this will be replaced with actual Supabase auth)
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Set user in state and localStorage
      setUser(foundUser);
      localStorage.setItem("chatUser", JSON.stringify(foundUser));
      
      toast.success("Signed in successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, username: string, phone?: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 800));
      
      // Check if email or username exists (will be replaced with Supabase)
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      if (MOCK_USERS.some(u => u.username === username)) {
        throw new Error("Username already taken");
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        username,
        phone,
        avatar: `https://i.pravatar.cc/150?u=${username}`,
      };
      
      // Set user in state and localStorage
      setUser(newUser);
      localStorage.setItem("chatUser", JSON.stringify(newUser));
      
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = () => {
    setUser(null);
    localStorage.removeItem("chatUser");
    toast.info("Signed out");
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
