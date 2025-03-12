
import React from "react";

export default function AuthBackground() {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
      <div className="absolute top-40 -right-4 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute -bottom-8 left-20 w-80 h-80 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "4s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/80" />
    </div>
  );
}
