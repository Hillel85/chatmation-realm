
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-300 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div className="relative z-10 flex items-center justify-center">
        {theme === "dark" ? (
          <Sun className="h-5 w-5 animate-spin-slow" />
        ) : (
          <Moon className="h-5 w-5 animate-spin-slow" />
        )}
      </div>
      <span 
        className="absolute inset-0 bg-primary/10 rounded-full transform scale-0 transition-transform duration-300 group-hover:scale-100"
      />
    </button>
  );
}
