import React, { useState, useEffect, useCallback } from "react";
import { GameProvider } from "@/context/GameContext";
import Map from "@/components/Map";
import Sidebar from "@/components/Sidebar";
import PixiRenderer from "@/components/PixiRenderer";
import OpenLayersMap from "@/components/OpenLayersMap";
import MapControls from "@/components/MapControls"; // Updated import
import { ConnectionStatusIndicator } from "@/components/ui/ConnectionStatus";
import webSocketService from "@/utils/WebSocketService";
import { type Map as OLMap } from 'ol';
import { fromLonLat } from 'ol/proj';

const CommandCenter: React.FC = () => {
  const [olMap, setOLMap] = useState<OLMap | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.5, 45.8]);
  const [mapZoom, setMapZoom] = useState<number>(3);

  const handleMapReady = useCallback((map: OLMap) => {
    console.log("Map is ready");
    setOLMap(map);
  }, []);

  useEffect(() => {
    console.log("CommandCenter mounted, olMap:", olMap ? "initialized" : "not initialized");
    
    // Initialize WebSocket connection
    webSocketService.connect().catch(error => {
      console.error("Failed to connect to WebSocket server:", error);
    });
    
    return () => {
      console.log("CommandCenter unmounted");
      // Close WebSocket connection when component unmounts
      webSocketService.close();
    };
  }, [olMap]);

  const handleZoomChange = (newZoom: number) => {
    setMapZoom(newZoom);
  };

  const handleCenterChange = (newCenter: [number, number]) => {
    setMapCenter(newCenter);
  };

  // Handlers for map controls
  const handleLeftClick = () => {
    if (olMap) {
      const view = olMap.getView();
      const center = view.getCenter() || [0, 0];
      const resolution = view.getResolution() || 1;
      view.setCenter([center[0] - resolution * 100, center[1]]); // Pan left
    }
  };

  const handleRightClick = () => {
    if (olMap) {
      const view = olMap.getView();
      const center = view.getCenter() || [0, 0];
      const resolution = view.getResolution() || 1;
      view.setCenter([center[0] + resolution * 100, center[1]]); // Pan right
    }
  };

  const handleUpClick = () => {
    if (olMap) {
      const view = olMap.getView();
      const center = view.getCenter() || [0, 0];
      const resolution = view.getResolution() || 1;
      view.setCenter([center[0], center[1] + resolution * 100]); // Pan up
    }
  };

  const handleDownClick = () => {
    if (olMap) {
      const view = olMap.getView();
      const center = view.getCenter() || [0, 0];
      const resolution = view.getResolution() || 1;
      view.setCenter([center[0], center[1] - resolution * 100]); // Pan down
    }
  };

  const handleCenterClick = () => {
    if (olMap) {
      olMap.getView().setCenter(fromLonLat([30.5, 45.8])); // Reset to default center
      olMap.getView().setZoom(3); // Reset to default zoom
      handleZoomChange(3);
    }
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
              <ConnectionStatusIndicator />
              <a href="#" className="text-sm hover:text-primary transition-colors">Log In</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          <div 
            className="flex-grow h-[calc(100vh-8rem)] overflow-hidden rounded-lg shadow-xl relative"
            style={{ background: 'transparent' }}
          >
            <div className="absolute inset-0 z-10">
              <OpenLayersMap
                center={mapCenter}
                zoom={mapZoom}
                className="w-full h-full"
                onMapReady={handleMapReady}
              />
            </div>
            <div className="absolute inset-0 z-20 pointer-events-auto">
              <Map
                disableMapZoom={true}
                olMap={olMap}
                onZoomChange={handleZoomChange}
              />
            </div>
            <div className="absolute inset-0 z-30 pointer-events-none">
              <PixiRenderer width={1000} height={800} className="w-full h-full" />
            </div>
            {/* MapControls in the bottom-right corner */}
            <div className="absolute bottom-4 right-4 z-40 pointer-events-auto">
              <MapControls
                onLeftClick={handleLeftClick}
                onRightClick={handleRightClick}
                onUpClick={handleUpClick}
                onDownClick={handleDownClick}
                onCenterClick={handleCenterClick}
              />
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