
import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import DiceRoller from "./DiceRoller";
import InitiativeTracker from "./InitiativeTracker";
import ChatBox from "./ChatBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Sidebar: React.FC = () => {
  const { gridType, setGridType, gridSize, setGridSize } = useGame();
  const [selectedTab, setSelectedTab] = useState("dice");

  return (
    <div className="h-full flex flex-col bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-primary text-primary-foreground border-b border-primary/10 flex items-center justify-between">
        <h2 className="text-lg font-medium">Game Tools</h2>
      </div>
      
      <Tabs 
        defaultValue="dice" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="grid grid-cols-3 px-4 py-2">
          <TabsTrigger value="dice">Dice</TabsTrigger>
          <TabsTrigger value="initiative">Combat</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dice" className="flex-1 p-4 space-y-4 overflow-y-auto">
          <DiceRoller />
        </TabsContent>
        
        <TabsContent value="initiative" className="flex-1 p-4 space-y-4 overflow-y-auto">
          <InitiativeTracker />
        </TabsContent>
        
        <TabsContent value="chat" className="flex-1 p-0 overflow-hidden flex flex-col">
          <ChatBox />
        </TabsContent>
      </Tabs>
      
      <div className="p-4 border-t border-border flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Grid Settings</h3>
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Grid Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setGridType("square")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    gridType === "square"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Square
                </button>
                <button
                  onClick={() => setGridType("hex")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    gridType === "hex"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Hex
                </button>
                <button
                  onClick={() => setGridType("none")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    gridType === "none"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  None
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Grid Size</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm w-8 text-right">{gridSize}px</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
