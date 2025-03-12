
import React from "react";
import AuthForms from "../components/AuthForms";
import AuthBackground from "../components/AuthBackground";
import { motion } from "framer-motion";

export default function Auth() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 relative">
      <AuthBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">ChatMaster</h1>
        <p className="text-muted-foreground">The next evolution of messaging</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <AuthForms />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 text-sm text-muted-foreground text-center"
      >
        <p>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
