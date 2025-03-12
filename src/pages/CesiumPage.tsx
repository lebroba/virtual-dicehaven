import React from "react";
import CesiumViewer from "@/components/CesiumViewer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CesiumPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground dark flex flex-col">
      {/* Header */}
      <header className="glass-panel p-4 border-b border-border relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="assets/hellhound-icon.svg" alt="Hellhound Icon" className="w-8 h-8" />
            <h1 className="text-xl font-bold">Virtual Dicehaven</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-primary transition-colors">Home</Link>
            <Link to="/cesium" className="text-sm text-primary font-semibold transition-colors">3D Globe</Link>
            <a href="#" className="text-sm hover:text-primary transition-colors">Settings</a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Cesium 3D Globe</h2>
          <Button asChild variant="outline">
            <Link to="/">Back to Map</Link>
          </Button>
        </div>
        
        <div className="prose prose-invert max-w-none mb-6">
          <p>
            This 3D globe powered by Cesium allows you to explore real-world terrain and 
            location data. You can switch between different view modes, add custom markers
            and shapes, and integrate with your campaign maps.
          </p>
        </div>
        
        <CesiumViewer className="w-full" />
      </main>
    </div>
  );
};

export default CesiumPage;