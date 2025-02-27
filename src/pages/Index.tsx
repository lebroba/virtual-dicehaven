
import React from "react";
import { GameProvider } from "@/context/GameContext";
import Map from "@/components/Map";
import Sidebar from "@/components/Sidebar";

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="glass-panel p-4 border-b border-border relative z-10">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Virtual Dicehaven</h1>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm hover:text-primary transition-colors">Maps</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Characters</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Settings</a>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden p-4 gap-4 container mx-auto">
          {/* Map area */}
          <div className="flex-1 min-w-0 h-[calc(100vh-8rem)] overflow-hidden rounded-lg shadow-xl animate-fade-in">
            <Map />
          </div>

          {/* Sidebar */}
          <div className="w-80 h-[calc(100vh-8rem)] animate-slide-in">
            <Sidebar />
          </div>
        </main>
      </div>
    </GameProvider>
  );
};

export default Index;
