
import React, { useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };
  
  return (
    <div className="h-screen flex overflow-hidden">
      <div className={`
        lg:w-80 w-full fixed lg:relative z-20 h-full 
        ${showMobileMenu ? 'block' : 'hidden lg:block'}
      `}>
        <ChatSidebar onMobileClose={() => setShowMobileMenu(false)} />
      </div>
      
      <div className="flex-1 h-full">
        <ChatWindow onMobileMenuToggle={toggleMobileMenu} />
      </div>
    </div>
  );
}
