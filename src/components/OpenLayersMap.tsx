
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
}

const OpenLayersMap: React.FC<OpenLayersMapProps> = ({
  center = [0, 0],
  zoom = 2,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);

  // Initialize OpenLayers map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create the OpenLayers map
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

    // Cleanup function
    return () => {
      olMap.setTarget(undefined);
      setMap(null);
    };
  }, []);

  // Update map view when props change
  useEffect(() => {
    if (!map) return;
    
    map.getView().setCenter(fromLonLat(center));
    map.getView().setZoom(zoom);
  }, [map, center, zoom]);

  return <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />;
};

export default OpenLayersMap;
