
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check session on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Fetch user profile data when authenticated
        fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Get the user's email from auth.users via the session
        const { data: sessionData } = await supabase.auth.getSession();
        const userEmail = sessionData.session?.user?.email || '';
        
        setUser({
          id: data.id,
          email: userEmail,
          username: data.username,
          phone: data.phone,
          avatar: data.avatar_url,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch user profile');
    }
  };
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, username: string, phone?: string) => {
    setIsLoading(true);
    
    try {
      // First check if username is available
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        throw new Error('Username already taken');
      }
      
      // Create auth user
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone,
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
      return;
    }
    setUser(null);
    toast.info('Signed out');
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
