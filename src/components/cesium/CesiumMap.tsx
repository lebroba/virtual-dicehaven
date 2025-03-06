
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship } from '@/types/supabase';
import { toast } from 'sonner';
import { Anchor, Navigation, Settings, Radar, MapPin, Crosshair, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Define the types for Cesium globals that will be loaded dynamically
declare global {
  interface Window {
    Cesium: any;
  }
}

interface CesiumMapProps {
  ships?: Ship[];
  selectedShipId?: string;
  centerLat?: number;
  centerLon?: number;
  mode?: 'mission' | 'tactical' | 'strategic';
}

const CesiumMap: React.FC<CesiumMapProps> = ({ 
  ships = [], 
  selectedShipId,
  centerLat = 32.7157, // Default to San Diego Naval Base
  centerLon = -117.1611,
  mode = 'tactical'
}) => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [coordinates, setCoordinates] = useState({ lat: centerLat, lon: centerLon });
  const navigate = useNavigate();

  useEffect(() => {
    // Load Cesium script dynamically
    const cesiumScript = document.createElement('script');
    cesiumScript.src = '/cesium/Build/Cesium/Cesium.js';
    cesiumScript.async = true;
    cesiumScript.onload = () => {
      initCesium();
    };
    
    document.body.appendChild(cesiumScript);

    // Load Cesium CSS
    const cesiumCss = document.createElement('link');
    cesiumCss.rel = 'stylesheet';
    cesiumCss.href = '/cesium/Build/Cesium/Widgets/widgets.css';
    document.head.appendChild(cesiumCss);

    return () => {
      // Clean up resources
      document.body.removeChild(cesiumScript);
      document.head.removeChild(cesiumCss);
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && viewerRef.current) {
      updateShips();
    }
  }, [ships, selectedShipId, isLoaded]);

  useEffect(() => {
    if (isLoaded && viewerRef.current) {
      // Focus camera on the provided coordinates
      viewerRef.current.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 50000),
        orientation: {
          heading: window.Cesium.Math.toRadians(0),
          pitch: window.Cesium.Math.toRadians(-45),
          roll: 0.0
        }
      });
    }
  }, [centerLat, centerLon, isLoaded]);

  const initCesium = () => {
    if (!cesiumContainer.current || !window.Cesium) return;

    try {
      // Configure Cesium to use our API key
      window.Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN || '';

      // Create the Cesium viewer with military-themed custom options
      viewerRef.current = new window.Cesium.Viewer(cesiumContainer.current, {
        terrainProvider: window.Cesium.createWorldTerrain(),
        imageryProvider: new window.Cesium.IonImageryProvider({ assetId: 3 }),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        animation: false,
        fullscreenButton: false,
        vrButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        shadows: true,
        terrainShadows: window.Cesium.ShadowMode.ENABLED,
        shouldAnimate: true
      });

      // Add click handler to capture coordinates
      const handler = new window.Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
      handler.setInputAction((movement: any) => {
        const cartesian = viewerRef.current.camera.pickEllipsoid(
          movement.position,
          viewerRef.current.scene.globe.ellipsoid
        );
        
        if (cartesian) {
          const cartographic = window.Cesium.Cartographic.fromCartesian(cartesian);
          const lat = window.Cesium.Math.toDegrees(cartographic.latitude);
          const lon = window.Cesium.Math.toDegrees(cartographic.longitude);
          setCoordinates({ lat, lon });
        }
      }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Configure globe appearance
      viewerRef.current.scene.globe.enableLighting = true;
      viewerRef.current.scene.globe.depthTestAgainstTerrain = true;
      viewerRef.current.scene.globe.showGroundAtmosphere = true;
      viewerRef.current.scene.skyAtmosphere.show = true;
      viewerRef.current.scene.fog.enabled = true;
      viewerRef.current.scene.fog.density = 0.0002;
      viewerRef.current.scene.fog.screenSpaceErrorFactor = 2.0;

      // Add the military grid reference system
      viewerRef.current.scene.globe.showWaterEffect = true;
      viewerRef.current.scene.globe.baseColor = window.Cesium.Color.BLACK;
      viewerRef.current.scene.globe.translucency.enabled = true;
      viewerRef.current.scene.globe.translucency.frontFaceAlpha = 0.95;

      // Initialize camera position to center coordinates
      viewerRef.current.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 50000),
        orientation: {
          heading: window.Cesium.Math.toRadians(0),
          pitch: window.Cesium.Math.toRadians(-45),
          roll: 0.0
        }
      });

      // Add tactical grid overlay
      addTacticalGrid();

      // Add ships to the map
      updateShips();

      setIsLoaded(true);
    } catch (error) {
      console.error('Error initializing Cesium:', error);
      toast.error('Failed to initialize 3D map. Please try again later.');
    }
  };

  const addTacticalGrid = () => {
    if (!viewerRef.current || !window.Cesium) return;

    // Create a tactical grid overlay
    const gridMaterial = new window.Cesium.GridMaterialProperty({
      color: window.Cesium.Color.TEAL.withAlpha(0.5),
      cellAlpha: 0.2,
      lineCount: new window.Cesium.Cartesian2(8, 8),
      lineThickness: new window.Cesium.Cartesian2(2.0, 2.0),
      lineOffset: new window.Cesium.Cartesian2(0.0, 0.0)
    });

    // Add the grid as an entity
    viewerRef.current.entities.add({
      name: 'Tactical Grid',
      rectangle: {
        coordinates: window.Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
        material: gridMaterial,
        height: 1000,
        outline: true,
        outlineColor: window.Cesium.Color.TEAL.withAlpha(0.4)
      }
    });
  };

  const updateShips = () => {
    if (!viewerRef.current || !window.Cesium) return;

    // Clear existing ship entities
    viewerRef.current.entities.removeAll();

    // Add tactical grid again after clearing
    addTacticalGrid();

    // Add ships
    ships.forEach((ship, index) => {
      // Compute a position based on the center coordinates and index
      // In a real app, ships would have their own coordinates
      const offsetLon = (index % 5) * 0.05 - 0.1;
      const offsetLat = Math.floor(index / 5) * 0.05 - 0.1;
      const shipLon = centerLon + offsetLon;
      const shipLat = centerLat + offsetLat;

      // Determine if this ship is selected
      const isSelected = ship.id === selectedShipId;
      
      // Create ship entity
      const shipEntity = viewerRef.current.entities.add({
        name: ship.name,
        position: window.Cesium.Cartesian3.fromDegrees(shipLon, shipLat, 0),
        billboard: {
          image: isSelected 
            ? '/assets/tactical-grid.svg' 
            : '/assets/tactical-grid.svg',
          scale: isSelected ? 0.8 : 0.5,
          color: isSelected 
            ? window.Cesium.Color.CYAN 
            : window.Cesium.Color.LIGHTSTEELBLUE,
          heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND,
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM
        },
        label: {
          text: ship.name,
          font: '10px monospace',
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new window.Cesium.Cartesian2(0, -10),
          showBackground: true,
          backgroundColor: window.Cesium.Color.BLACK.withAlpha(0.7),
          backgroundPadding: new window.Cesium.Cartesian2(7, 5),
          disableDepthTestDistance: 100000,
          fillColor: isSelected 
            ? window.Cesium.Color.CYAN 
            : window.Cesium.Color.LIGHTCYAN
        },
        // Custom properties
        properties: {
          shipId: ship.id,
          shipClass: ship.class,
          shipType: ship.type,
          nation: ship.nation,
          selected: isSelected
        }
      });

      // Add a pulse effect for selected ships
      if (isSelected) {
        viewerRef.current.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(shipLon, shipLat, 0),
          ellipse: {
            semiMinorAxis: 3000,
            semiMajorAxis: 3000,
            height: 0,
            material: new window.Cesium.StripeMaterialProperty({
              evenColor: window.Cesium.Color.CYAN.withAlpha(0),
              oddColor: window.Cesium.Color.CYAN.withAlpha(0.5),
              repeat: 10,
              orientation: window.Cesium.StripeOrientation.VERTICAL
            }),
            outline: true,
            outlineColor: window.Cesium.Color.CYAN.withAlpha(0.8)
          }
        });
      }
    });
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const zoomIn = () => {
    if (viewerRef.current) {
      const currentPosition = viewerRef.current.camera.position;
      const currentDirection = viewerRef.current.camera.direction;
      const newPosition = window.Cesium.Cartesian3.add(
        currentPosition,
        window.Cesium.Cartesian3.multiplyByScalar(currentDirection, 10000, new window.Cesium.Cartesian3()),
        new window.Cesium.Cartesian3()
      );
      viewerRef.current.camera.flyTo({
        destination: newPosition,
        orientation: {
          heading: viewerRef.current.camera.heading,
          pitch: viewerRef.current.camera.pitch,
          roll: viewerRef.current.camera.roll
        },
        duration: 0.5
      });
    }
  };

  const zoomOut = () => {
    if (viewerRef.current) {
      const currentPosition = viewerRef.current.camera.position;
      const currentDirection = viewerRef.current.camera.direction;
      const newPosition = window.Cesium.Cartesian3.subtract(
        currentPosition,
        window.Cesium.Cartesian3.multiplyByScalar(currentDirection, 10000, new window.Cesium.Cartesian3()),
        new window.Cesium.Cartesian3()
      );
      viewerRef.current.camera.flyTo({
        destination: newPosition,
        orientation: {
          heading: viewerRef.current.camera.heading,
          pitch: viewerRef.current.camera.pitch,
          roll: viewerRef.current.camera.roll
        },
        duration: 0.5
      });
    }
  };

  const returnToSelectedShip = () => {
    if (!selectedShipId || !viewerRef.current) return;
    const selectedShip = ships.find(ship => ship.id === selectedShipId);
    if (!selectedShip) return;

    // In a real app, the ship would have its own coordinates
    // Here we use the center coordinates with a small offset
    const shipLon = centerLon + 0.01;
    const shipLat = centerLat + 0.01;

    viewerRef.current.camera.flyTo({
      destination: window.Cesium.Cartesian3.fromDegrees(shipLon, shipLat, 10000),
      orientation: {
        heading: window.Cesium.Math.toRadians(0),
        pitch: window.Cesium.Math.toRadians(-45),
        roll: 0.0
      }
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={cesiumContainer} className="w-full h-full bg-black"></div>
      
      {/* Controls panel */}
      <div className="absolute right-4 top-4 glass-panel shadow-lg rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-2 bg-primary/20 border-b border-primary/30">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono">NAVIGATION</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={toggleControls}
          >
            {showControls ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {showControls && (
          <div className="p-3 space-y-3">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={zoomIn} className="flex-1">
                Zoom In
              </Button>
              <Button size="sm" variant="outline" onClick={zoomOut} className="flex-1">
                Zoom Out
              </Button>
            </div>
            
            {selectedShipId && (
              <Button 
                size="sm" 
                variant="default" 
                onClick={returnToSelectedShip}
                className="w-full"
              >
                <Crosshair className="h-4 w-4 mr-2" />
                Center on Ship
              </Button>
            )}
            
            <Separator />
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground">Position</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="font-mono text-xs justify-center">
                  LAT: {coordinates.lat.toFixed(4)}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs justify-center">
                  LON: {coordinates.lon.toFixed(4)}
                </Badge>
              </div>
            </div>
            
            {mode === 'tactical' && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Radar className="h-4 w-4 text-primary" strokeWidth={1.5} />
                    <span className="text-xs text-muted-foreground">Active Units</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs justify-center w-full">
                    {ships.length} VESSELS
                  </Badge>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Status banner */}
      <div className="absolute bottom-4 left-4 right-4 glass-panel shadow-lg rounded-lg p-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-mono text-xs">
            <Anchor className="h-3 w-3 mr-1" />
            NAVAL TACTICAL DISPLAY
          </Badge>
          
          <Badge variant="outline" className="font-mono text-xs">
            <Settings className="h-3 w-3 mr-1" />
            {isLoaded ? 'SYSTEM ACTIVE' : 'INITIALIZING...'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default CesiumMap;
