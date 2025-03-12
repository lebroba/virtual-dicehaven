
import React, { useEffect } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import Map from "@/components/Map";
import Sidebar from "@/components/Sidebar";
import { generateAllSymbolCombinations, getRandomPosition } from "@/utils/symbolTestUtils";
import { toast } from "sonner";

// Inner component to access context
const CommandCenterContent: React.FC = () => {
  const { addToken } = useGame();

  // Add test symbols on mount
  useEffect(() => {
    // Get all possible symbol combinations
    const symbolCombinations = generateAllSymbolCombinations();
    
    // Generate a random position for each symbol
    symbolCombinations.forEach((combo, index) => {
      const position = getRandomPosition(800, 600);
      
      // Add the token with this symbol type
      addToken({
        id: combo.id,
        name: `${combo.identity} ${combo.domain}`,
        image: "", // Not using image for symbols
        x: position.x,
        y: position.y,
        size: 40,
        controlledBy: "player",
        visible: true,
        conditions: [],
        symbolType: {
          identity: combo.identity,
          domain: combo.domain
        }
      });
    });

    toast.success(`Added ${symbolCombinations.length} military symbols to the map`);
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
