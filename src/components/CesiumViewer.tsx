import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Using Cesium Ion access token from environment variables
const DEFAULT_TOKEN = import.meta.env.VITE_CESIUM_API_KEY || import.meta.env.VITE_CESIUM_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkODA5YzFmNy01YjA2LTQ0MzgtODJlMC00M2Y4MzhlYmZiNDUiLCJpZCI6MjYxNTIwLCJpYXQiOjE3NDAzMjI3NjZ9.nq6ZkXLwRdO1ajCdKrvfSL26xlQTzuHnppxR1hI7s_o";

interface CesiumViewerProps {
  className?: string;
  defaultLocation?: {
    longitude: number;
    latitude: number;
    height?: number;
  };
}

const CesiumViewer: React.FC<CesiumViewerProps> = ({ 
  className,
  defaultLocation = { longitude: -75.62898254394531, latitude: 40.02804946899414, height: 1000 } 
}) => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [activeView, setActiveView] = useState<string>("3d");
  
  // Initialize the Cesium viewer
  useEffect(() => {
    if (!cesiumContainer.current) return;
    
    try {
      console.log("Starting Cesium initialization...");
      
      // Set the base URL explicitly for Cesium to find assets
      window.CESIUM_BASE_URL = "/cesium";
      
      // Set your access token
      if (!DEFAULT_TOKEN) {
        console.error("Cesium Ion access token is not defined in environment variables");
      }
      Cesium.Ion.defaultAccessToken = DEFAULT_TOKEN;
      
      console.log("Initializing Cesium with token:", DEFAULT_TOKEN ? "Valid token provided" : "Missing token");
      
      // Configure the viewer with different settings based on whether it's used in map or standalone
      const isFullMapView = className === "h-full";
      const viewer = new Cesium.Viewer(cesiumContainer.current, {
        terrainProvider: Cesium.createWorldTerrain(),
        animation: false,
        baseLayerPicker: !isFullMapView, // Hide controls in map view
        fullscreenButton: false,
        geocoder: !isFullMapView,
        homeButton: !isFullMapView,
        infoBox: !isFullMapView,
        sceneModePicker: !isFullMapView,
        selectionIndicator: !isFullMapView,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
    });
    
    // Remove Cesium credits
    viewer.cesiumWidget.creditContainer.style.display = "none";
    
    // Fly to the default location
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        defaultLocation.longitude,
        defaultLocation.latitude,
        defaultLocation.height || 1000
      ),
      orientation: {
        heading: 0.0,
        pitch: -Math.PI / 4,
        roll: 0.0,
      },
      complete: function() {
        // Force 2D mode after the camera is positioned if in map view
        if (isFullMapView) {
          viewer.scene.mode = Cesium.SceneMode.SCENE2D;
          console.log("Camera positioned and 2D mode set for map view");
        }
      }
    });
    
    // Save viewer reference for cleanup
    viewerRef.current = viewer;
    
    // Only add sample data if not in map view mode
    if (!isFullMapView) {
      // Add some sample data - Create a point
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          defaultLocation.longitude, 
          defaultLocation.latitude
        ),
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
        },
        label: {
          text: 'Starting Location',
          font: '14pt sans-serif',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9),
        }
      });
    }
    
    // Clean up on unmount
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
        } catch (error) {
          console.error("Error destroying Cesium viewer:", error);
        }
      }
    };
    } catch (error) {
      console.error("Error initializing Cesium:", error);
    }
  }, [defaultLocation]);
  
  // Handle view mode changes
  useEffect(() => {
    if (!viewerRef.current) return;
    
    if (activeView === "2d") {
      viewerRef.current.scene.morphTo2D(1);
    } else if (activeView === "3d") {
      viewerRef.current.scene.morphTo3D(1);
    } else if (activeView === "columbus") {
      viewerRef.current.scene.morphToColumbusView(1);
    }
  }, [activeView]);
  
  // Function to add a sample polygon to the map
  const addSamplePolygon = () => {
    if (!viewerRef.current) return;
    
    const { longitude, latitude } = defaultLocation;
    
    viewerRef.current.entities.add({
      name: 'Sample polygon',
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          longitude - 0.01, latitude - 0.01,
          longitude + 0.01, latitude - 0.01,
          longitude + 0.01, latitude + 0.01,
          longitude - 0.01, latitude + 0.01,
        ]),
        material: Cesium.Color.BLUE.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.WHITE,
      }
    });
    
    // Notify the user
    alert('Sample polygon added!');
  };
  
  return (
    <div className={`relative ${className || ""}`}>
      {/* Cesium control panel - only shown for dedicated Cesium page, not map */}
      {className !== "h-full" && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle>Cesium 3D Map</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="mb-2">
                <TabsTrigger value="3d">3D View</TabsTrigger>
                <TabsTrigger value="2d">2D View</TabsTrigger>
                <TabsTrigger value="columbus">Columbus View</TabsTrigger>
              </TabsList>
              <div className="flex gap-2 mb-2">
                <Button onClick={addSamplePolygon} size="sm">Add Sample Polygon</Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <div 
        ref={cesiumContainer} 
        className="w-full h-full rounded-md overflow-hidden border border-muted" 
        style={{ minHeight: "600px" }}
      />
      
      {/* Controls help - only shown for dedicated Cesium page, not map integration */}
      {className !== "h-full" && (
        <div className="absolute bottom-4 right-4 glass-panel p-2 rounded-lg text-sm text-white">
          <div>Use mouse to navigate:</div>
          <div>Left-click + drag: Rotate</div>
          <div>Right-click + drag: Zoom</div>
          <div>Middle-click + drag: Pan</div>
        </div>
      )}
    </div>
  );
};

export default CesiumViewer;