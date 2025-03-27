import React, { useState } from "react";
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

  const handleMapReady = (map: OLMap) => {
    setOLMap(map);
  };

  const handleZoomChange = (newZoom: number) => {
    setMapZoom(newZoom);
    if (olMap) olMap.getView().setZoom(newZoom);
  };

  const handleCenterChange = (newCenter: [number, number]) => {
    setMapCenter(newCenter);
    if (olMap) olMap.getView().setCenter(fromLonLat(newCenter));
  };

  return (
    <GameProvider>
      <div className="min-h-screen bg-transparent text-foreground dark flex flex-col">
        <header className="glass-panel p-4 border-b border-border relative z-10">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img src="/assets/hellhound-icon.svg" alt="Hellhound icon" className="h-8 w-auto" />
                <img src="/assets/text-logo.svg" alt="Dicehaven" className="h-6 w-auto" />
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm hover:text-primary transition-colors">Maps</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Tactical View</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Settings</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          <div className="flex-grow h-[calc(100vh-8rem)] overflow-hidden rounded-lg shadow-xl animate-fade-in relative bg-transparent">
            <div className="absolute inset-0 z-10">
              <OpenLayersMap
                center={mapCenter}
                zoom={mapZoom}
                className="w-full h-full"
                onMapReady={handleMapReady}
              />
            </div>
            {/* <div className="absolute inset-0 z-20 pointer-events-none">
              <PixiRenderer width={1000} height={800} className="w-full h-full" />
            </div> */}
            <div className="absolute inset-0 z-30 pointer-events-auto">
              <Map disableMapZoom={true} olMap={olMap} onZoomChange={handleZoomChange} />
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