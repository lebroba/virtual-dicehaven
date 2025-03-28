import React from "react";
import { GameBoard } from "../components/GameBoard";

const NavalWarfare: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground dark flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border relative z-10 bg-slate-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Age of Sail: Naval Command</h1>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm hover:text-primary transition-colors">Home</a>
            <a href="/command-center" className="text-sm hover:text-primary transition-colors">Command Center</a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4">
        <GameBoard />
      </main>
      
      {/* Footer */}
      <footer className="p-4 border-t border-border bg-slate-800 text-sm text-center text-slate-400">
        Virtual Dicehaven &copy; 2025 - Age of Sail Naval Warfare Module
      </footer>
    </div>
  );
};

export default NavalWarfare;