
import React from "react";
import { GameProvider } from "@/context/GameContext";
import Map from "@/components/Map";
import Sidebar from "@/components/Sidebar";

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-background text-foreground dark flex flex-col">
        {/* Header */}
        <header className="glass-panel p-4 border-b border-border relative z-10">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/assets/hellhound-icon.svg" 
                  alt="Hellhound icon" 
                  className="h-8 w-auto"
                />
                <img 
                  src="/assets/text-logo.svg" 
                  alt="Dicehaven" 
                  className="h-6 w-auto"
                />
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm hover:text-primary transition-colors">Maps</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Characters</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Settings</a>
            </nav>
          </div>
        </header>

        {/* Main content - removed container constraint to allow full width */}
        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Map area - now flex-grow-1 to take up all available space */}
          <div className="flex-grow h-[calc(100vh-8rem)] overflow-hidden rounded-lg shadow-xl animate-fade-in">
            <Map />
          </div>

          {/* Sidebar - fixed width of 320px (w-80) */}
          <div className="w-80 flex-shrink-0 h-[calc(100vh-8rem)] animate-slide-in">
            <Sidebar />
          </div>
        </main>
      </div>
    </GameProvider>
  );
};

export default Index;
