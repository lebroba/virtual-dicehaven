
import React, { useState, useEffect, useCallback } from "react";
import { GameProvider } from "@/context/GameContext";
import Map from "@/components/Map";
import Sidebar from "@/components/Sidebar";
import PixiRenderer from "@/components/PixiRenderer";
import OpenLayersMap from "@/components/OpenLayersMap";
import MapControls from "@/components/MapControls";
import { ConnectionStatusIndicator } from "@/components/ui/ConnectionStatus";
import webSocketService from "@/utils/WebSocketService";
import { type Map as OLMap } from 'ol';
import { fromLonLat } from 'ol/proj';
import { toast } from "sonner";

const CommandCenter: React.FC = () => {
  const [olMap, setOLMap] = useState<OLMap | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.5, 45.8]);
  const [mapZoom, setMapZoom] = useState<number>(3);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  const handleMapReady = useCallback((map: OLMap) => {
    console.log("Map is ready");
    setOLMap(map);
    setMapReady(true);
  }, []);

  useEffect(() => {
    console.log("CommandCenter mounted, olMap:", olMap ? "initialized" : "not initialized");
    
    // Add connection status listener
    const handleConnectionChange = (data: any) => {
      if (data.status === 'connected') {
        setWsConnected(true);
      } else {
        setWsConnected(false);
      }
      
      // Show connection status changes in toast
      if (data.status === 'disconnected' || data.status === 'closed') {
        toast.error("WebSocket disconnected", {
          description: "Server connection lost. Game data will not be synchronized."
        });
      } else if (data.status === 'connected') {
        toast.success("WebSocket connected", {
          description: "Server connection established. Game data will be synchronized."
        });
      }
    };
    
    webSocketService.on('connectionChange', handleConnectionChange);
    
    // Initialize WebSocket connection with auto-reconnect disabled after first failure
    webSocketService.connect().catch(error => {
      console.error("Failed to connect to WebSocket server:", error);
      webSocketService.setAutoReconnect(false);
      toast.error("Failed to connect to server", {
        description: "Server might be unavailable. Application will run in offline mode.",
        duration: 5000
      });
    });
    
    return () => {
      console.log("CommandCenter unmounted");
      // Remove connection status listener
      webSocketService.off('connectionChange', handleConnectionChange);
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

  // Handlers for map controls with better null checking
  const handleLeftClick = () => {
    if (olMap) {
      try {
        const view = olMap.getView();
        if (view) {
          const center = view.getCenter();
          if (!center) return;
          
          const resolution = view.getResolution() || 1;
          view.setCenter([center[0] - resolution * 100, center[1]]); // Pan left
        }
      } catch (error) {
        console.error("Error handling left click:", error);
      }
    }
  };

  const handleRightClick = () => {
    if (olMap) {
      try {
        const view = olMap.getView();
        if (view) {
          const center = view.getCenter();
          if (!center) return;
          
          const resolution = view.getResolution() || 1;
          view.setCenter([center[0] + resolution * 100, center[1]]); // Pan right
        }
      } catch (error) {
        console.error("Error handling right click:", error);
      }
    }
  };

  const handleUpClick = () => {
    if (olMap) {
      try {
        const view = olMap.getView();
        if (view) {
          const center = view.getCenter();
          if (!center) return;
          
          const resolution = view.getResolution() || 1;
          view.setCenter([center[0], center[1] + resolution * 100]); // Pan up
        }
      } catch (error) {
        console.error("Error handling up click:", error);
      }
    }
  };

  const handleDownClick = () => {
    if (olMap) {
      try {
        const view = olMap.getView();
        if (view) {
          const center = view.getCenter();
          if (!center) return;
          
          const resolution = view.getResolution() || 1;
          view.setCenter([center[0], center[1] - resolution * 100]); // Pan down
        }
      } catch (error) {
        console.error("Error handling down click:", error);
      }
    }
  };

  const handleCenterClick = () => {
    if (olMap) {
      try {
        const view = olMap.getView();
        if (view) {
          view.setCenter(fromLonLat([30.5, 45.8])); // Reset to default center
          view.setZoom(3); // Reset to default zoom
          handleZoomChange(3);
        }
      } catch (error) {
        console.error("Error handling center click:", error);
      }
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
            {mapReady && (
              <>
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
              </>
            )}
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
