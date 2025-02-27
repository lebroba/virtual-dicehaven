
import React, { useRef, useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import GridOverlay from "./GridOverlay";
import TokenLayer from "./TokenLayer";

const Map: React.FC = () => {
  const { gridType, gridSize } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] = useState("/placeholder.svg");

  // Sample background images to choose from (in a real app, these would be user-provided)
  const sampleBackgrounds = [
    "/placeholder.svg",
    "https://images.unsplash.com/photo-1585202900225-6d3ac20a6962?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop",
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging the map with the middle mouse button or space+click
    if (e.button === 1 || e.button === 0 && e.shiftKey) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.5), 3);
    setScale(newScale);
  };

  const handleChangeBackground = () => {
    const currentIndex = sampleBackgrounds.indexOf(backgroundImage);
    const nextIndex = (currentIndex + 1) % sampleBackgrounds.length;
    setBackgroundImage(sampleBackgrounds[nextIndex]);
  };

  // Size the map container to fit the parent
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      });
      
      resizeObserver.observe(containerRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-900 rounded-lg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div 
        className="absolute transition-transform duration-100"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "center",
          width: dimensions.width,
          height: dimensions.height,
        }}
      >
        {/* Background image layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        
        {/* Grid overlay */}
        <GridOverlay 
          width={dimensions.width} 
          height={dimensions.height}
          gridSize={gridSize} 
          gridType={gridType} 
        />
        
        {/* Token layer */}
        <TokenLayer />
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 glass-panel p-2 rounded-lg">
        <button 
          onClick={() => setScale(Math.min(scale * 1.2, 3))}
          className="w-8 h-8 flex items-center justify-center bg-secondary/80 hover:bg-secondary rounded-full hover-glow"
        >
          +
        </button>
        <button 
          onClick={() => setScale(Math.max(scale * 0.8, 0.5))}
          className="w-8 h-8 flex items-center justify-center bg-secondary/80 hover:bg-secondary rounded-full hover-glow"
        >
          -
        </button>
        <button 
          onClick={() => setPosition({ x: 0, y: 0 })}
          className="w-8 h-8 flex items-center justify-center bg-secondary/80 hover:bg-secondary rounded-full hover-glow"
        >
          ⌂
        </button>
        <button 
          onClick={handleChangeBackground}
          className="w-8 h-8 flex items-center justify-center bg-secondary/80 hover:bg-secondary rounded-full hover-glow"
        >
          🖼️
        </button>
      </div>

      {/* Map info and status */}
      <div className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-lg text-sm">
        <div className="font-semibold">Battle Map</div>
        <div className="text-xs text-muted-foreground">Scale: {Math.round(scale * 100)}%</div>
      </div>
    </div>
  );
};

export default Map;
