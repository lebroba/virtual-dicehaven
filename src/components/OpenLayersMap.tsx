
import React, { useRef, useEffect, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

interface OpenLayersMapProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  className?: string;
  onMapReady?: (map: Map) => void;
}

const OpenLayersMap: React.FC<OpenLayersMapProps> = ({
  center = [0, 0],
  zoom = 2,
  className,
  onMapReady,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);

  // Initialize OpenLayers map
  useEffect(() => {
    if (!mapRef.current) return;

    console.log("Initializing OpenLayers map");

    // Create the OpenLayers map
    const olMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM({
            // Use a standard OpenStreetMap source to ensure it loads properly
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }),
          opacity: 1.0,
        }),
      ],
      view: new View({
        center: fromLonLat(center),
        zoom,
        maxZoom: 19,
      }),
      controls: [],
    });

    setMap(olMap);
    
    // Call onMapReady callback with the created map
    if (onMapReady) {
      onMapReady(olMap);
    }

    // Ensure map resizes with container
    const handleResize = () => {
      setTimeout(() => {
        olMap.updateSize();
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      olMap.setTarget(undefined);
      setMap(null);
    };
  }, [onMapReady]);

  // Update map view when props change
  useEffect(() => {
    if (!map) return;
    
    map.getView().setCenter(fromLonLat(center));
    map.getView().setZoom(zoom);
  }, [map, center, zoom]);

  return (
    <div 
      ref={mapRef} 
      className={`${className || ''}`} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        zIndex: 1 
      }} 
    />
  );
};

export default OpenLayersMap;
