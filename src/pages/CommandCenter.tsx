import React, { useState, useEffect, useCallback } from "react";
import { GameProvider } from "@/context/GameContext";
import Map from "@/components/Map";
import Sidebar from "@/components/Sidebar";
import PixiRenderer from "@/components/PixiRenderer";
import OpenLayersMap from "@/components/OpenLayersMap";
import { type Map as OLMap } from 'ol';
import { fromLonLat } from 'ol/proj';

const CommandCenter: React.FC = () => {
  const [olMap, setOLMap] = useState<OLMap | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.5, 45.8]);
  const [mapZoom, setMapZoom] = useState<number>(3);

  // Memoize handleMapReady to prevent redefinition on every render
  const handleMapReady = useCallback((map: OLMap) => {
    console.log("Map is ready");
    setOLMap(map);
  }, []); // Empty dependency array: function is stable

  // Debug map initialization
  useEffect(() => {
    console.log("CommandCenter mounted, olMap:", olMap ? "initialized" : "not initialized");
    return () => console.log("CommandCenter unmounted");
  }, [olMap]);

  // Update state only; OpenLayersMap handles view updates
  const handleZoomChange = (newZoom: number) => {
    setMapZoom(newZoom);
  };

  const handleCenterChange = (newCenter: [number, number]) => {
    setMapCenter(newCenter);
  };

  return (
    <GameProvider>
      <div className="min-h-screen bg-transparent text-foreground dark flex flex-col">
        <header className="glass-panel p-4 border-b border-border relative z-20">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img src="/assets/hellhound-icon.svg" alt="Hellhound icon" className="h-8 w-auto" />
                <img src="/assets/text-logo.svg" alt="Dicehaven" className="h-6 w-auto" />
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm hover:text-primary transition-colors">Log In</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          <div 
            className="flex-grow h-[calc(100vh-8rem)] overflow-hidden rounded-lg shadow-xl relative"
            style={{ background: 'transparent' }}
          >
            {/* Layer 1: OpenLayers Map (Bottom) */}
            <div className="absolute inset-0 z-10">
              <OpenLayersMap
                center={mapCenter}
                zoom={mapZoom}
                className="w-full h-full"
                onMapReady={handleMapReady}
              />
            </div>

            {/* Layer 2: Tactical Grid Map (Middle) */}
            <div className="absolute inset-0 z-20 pointer-events-auto">
              <Map
                disableMapZoom={true}
                olMap={olMap}
                onZoomChange={handleZoomChange}
              />
            </div>

            {/* Layer 3: PixiJS Renderer (Top) */}
            <div className="absolute inset-0 z-30 pointer-events-none">
              <PixiRenderer width={1000} height={800} className="w-full h-full" />
            </div>
          </div>

          <div className="w-80 flex-shrink-0 h-[calc(100vh-8rem)] animate-slide-in">
            <Sidebar />
          </div>
        </main>
      </div>
    </GameProvider>
  );
};

export default CommandCenter;