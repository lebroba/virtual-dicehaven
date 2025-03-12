
import React, { useEffect } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import Map from "@/components/Map";
import Sidebar from "@/components/Sidebar";
import { toast } from "sonner";

// Inner component to access context
const CommandCenterContent: React.FC = () => {
  const { addToken } = useGame();

  // Add a friendly sea surface unit on mount
  useEffect(() => {
    // Add a friendly sea surface unit
    addToken({
      id: `friendly-sea-surface-${Date.now()}`,
      name: "Friendly Sea Surface Unit",
      image: "", // Not using image for symbols
      x: 400, // Center of the map (assuming 800 width)
      y: 300, // Center of the map (assuming 600 height)
      size: 50,
      controlledBy: "player",
      visible: true,
      conditions: [],
      symbolType: {
        identity: "friend",
        domain: "sea-surface"
      }
    });

    toast.success("Added a friendly sea surface unit to the map");
  }, [addToken]);

  return (
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

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Map area */}
        <div className="flex-grow h-[calc(100vh-8rem)] overflow-hidden rounded-lg shadow-xl animate-fade-in">
          <Map />
        </div>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 h-[calc(100vh-8rem)] animate-slide-in">
          <Sidebar />
        </div>
      </main>
    </div>
  );
};

const CommandCenter: React.FC = () => {
  return (
    <GameProvider>
      <CommandCenterContent />
    </GameProvider>
  );
};

export default CommandCenter;
