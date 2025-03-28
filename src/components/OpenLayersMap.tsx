import React, { useRef, useEffect, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

interface OpenLayersMapProps {
  center?: [number, number];
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

  useEffect(() => {
    if (!mapRef.current) return;

    console.log("Initializing OpenLayers map");

    const olMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
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
    if (onMapReady) onMapReady(olMap);

    const handleResize = () => {
      setTimeout(() => {
        olMap.updateSize();
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      olMap.setTarget(undefined);
      setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    console.log("Updating map view:", { center, zoom });
    map.getView().setCenter(fromLonLat(center));
    map.getView().setZoom(zoom);
  }, [map, center, zoom]);

  useEffect(() => {
    if (!map || !onMapReady) return;
    onMapReady(map);
  }, [map, onMapReady]);

  return (
    <div 
      ref={mapRef} 
      className={`${className || ''} bg-transparent`} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        zIndex: 1,
        background: 'transparent'
      }} 
    />
  );
};

export default OpenLayersMap;