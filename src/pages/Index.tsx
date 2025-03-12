
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Auth from "./Auth";
import Chat from "./Chat";

export default function Index() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return user ? <Chat /> : <Auth />;
}
