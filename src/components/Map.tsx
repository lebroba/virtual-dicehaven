import React, { useRef, useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import GridOverlay from "./GridOverlay";
import TokenLayer from "./TokenLayer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Layers, Hand, PenTool, Ruler, Dice1, Settings, MousePointer, PaintBucket } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { type Map as OLMap } from 'ol';
import { fromLonLat } from 'ol/proj';

interface MapProps {
  disableMapZoom?: boolean;
  olMap?: OLMap | null;
  onZoomChange?: (zoom: number) => void;
}

const Map: React.FC<MapProps> = ({ 
  disableMapZoom = false, 
  olMap = null,
  onZoomChange
}) => {
  const {
    gridType,
    gridSize,
    selectedTokenId,
    tokens
  } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 1000,
    height: 800
  });
  
  // We'll use a local scale for the grid overlay only, no position state needed
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0
  });
  const [backgroundImage, setBackgroundImage] = useState("/placeholder.svg");
  const [selectedTool, setSelectedTool] = useState<string>("select");

  // Sample background images to choose from (in a real app, these would be user-provided)
  const sampleBackgrounds = ["/placeholder.svg", "https://images.unsplash.com/photo-1585202900225-6d3ac20a6962?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop"];
  
  const handleMouseDown = (e: React.MouseEvent) => {
    // If map zooming is disabled, don't handle dragging
    if (disableMapZoom) return;
    
    // Only allow dragging the map with the middle mouse button or space+click
    if (e.button === 1 || e.button === 0 && e.shiftKey) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !disableMapZoom) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY
      });
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    // If map zooming is disabled, don't process wheel events
    if (disableMapZoom) return;
    
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
      const resizeObserver = new ResizeObserver(entries => {
        const {
          width,
          height
        } = entries[0].contentRect;
        setDimensions({
          width,
          height
        });
      });
      resizeObserver.observe(containerRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Handle zoom in control - now controls OpenLayers map
  const handleZoomIn = () => {
    if (olMap && onZoomChange) {
      const currentZoom = olMap.getView().getZoom() || 3;
      const newZoom = Math.min(currentZoom + 1, 19);
      onZoomChange(newZoom);
    }
  };

  // Handle zoom out control - now controls OpenLayers map
  const handleZoomOut = () => {
    if (olMap && onZoomChange) {
      const currentZoom = olMap.getView().getZoom() || 3;
      const newZoom = Math.max(currentZoom - 1, 0);
      onZoomChange(newZoom);
    }
  };

  // Handle zoom slider change - now controls OpenLayers map
  const handleZoomSliderChange = (value: number[]) => {
    if (olMap && onZoomChange) {
      const newZoom = sliderValueToZoom(value[0]);
      onZoomChange(newZoom);
    }
  };

  // Get current OpenLayers map zoom level
  const getCurrentMapZoom = () => {
    if (olMap) {
      return olMap.getView().getZoom() || 3;
    }
    return 3; // Default zoom
  };

  // Calculate the slider value from OpenLayers zoom
  // OpenLayers zoom is typically 0-19, map to 0-100 for the slider
  const zoomToSliderValue = (zoomValue: number) => {
    return (zoomValue / 19) * 100;
  };

  // Calculate the OpenLayers zoom from slider value
  // Slider range is 0-100, map to 0-19 for OpenLayers zoom
  const sliderValueToZoom = (sliderValue: number) => {
    return (sliderValue / 100) * 19;
  };

  // Handle center view - now centers the OpenLayers map
  const handleCenterView = () => {
    if (olMap) {
      olMap.getView().setCenter(fromLonLat([30.5, 45.8])); // Reset to default center
      olMap.getView().setZoom(3); // Reset to default zoom
      if (onZoomChange) {
        onZoomChange(3);
      }
    }
  };

  // Find and center on the selected token
  const handleFocusSelected = () => {
    if (!selectedTokenId || !containerRef.current) return;
    const selectedToken = tokens.find(token => token.id === selectedTokenId);
    if (!selectedToken) return;

    // Calculate the center position of the container
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Set the OpenLayers map to center on the token
    if (olMap) {
      // This is a simplified approach - in a real app, you would
      // convert token coordinates to map coordinates
      const x = selectedToken.x / containerWidth;
      const y = selectedToken.y / containerHeight;
      
      // Since we don't have proper geo-coordinates for tokens, 
      // this is just to demonstrate the concept
      const currentCenter = olMap.getView().getCenter() || [0, 0];
      olMap.getView().setCenter(currentCenter);
      
      // Zoom in slightly
      const currentZoom = olMap.getView().getZoom() || 3;
      const newZoom = Math.min(currentZoom + 1, 19);
      olMap.getView().setZoom(newZoom);
      
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    }
  };

  // Change the selected tool
  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    console.log(`Selected tool: ${tool}`);
  };

  // Action bar tools configuration
  const tools = [{
    id: 'select',
    icon: <MousePointer size={20} />,
    tooltip: 'Select Tool'
  }, {
    id: 'pan',
    icon: <Hand size={20} />,
    tooltip: 'Pan Tool'
  }, {
    id: 'draw',
    icon: <PenTool size={20} />,
    tooltip: 'Drawing Tools'
  }, {
    id: 'measure',
    icon: <Ruler size={20} />,
    tooltip: 'Measurement Tool'
  }, {
    id: 'fill',
    icon: <PaintBucket size={20} />,
    tooltip: 'Fill Tool'
  }, {
    id: 'dice',
    icon: <Dice1 size={20} />,
    tooltip: 'Roll Dice'
  }];

  // Action bar sections
  const actionBarSections = [{
    title: 'Tools',
    items: tools
  }, {
    title: 'Layers',
    items: [{
      id: 'map',
      icon: <Layers size={20} />,
      tooltip: 'Map Layer'
    }, {
      id: 'tokens',
      icon: <div className="text-xs font-bold">T</div>,
      tooltip: 'Token Layer'
    }, {
      id: 'gm',
      icon: <div className="text-xs font-bold">GM</div>,
      tooltip: 'GM Layer'
    }]
  }, {
    title: 'Settings',
    items: [{
      id: 'settings',
      icon: <Settings size={20} />,
      tooltip: 'Settings'
    }]
  }];

  // Get the current zoom level to display
  const currentMapZoom = olMap ? Math.round((olMap.getView().getZoom() || 3) * 10) / 10 : 3;
  
  return <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-transparent rounded-lg" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
      {/* We no longer transform the entire container, only the grid overlay */}
      <div className="absolute inset-0 pointer-events-none bg-transparent">
        {/* Grid overlay - static, doesn't move with map zooming */}
        <GridOverlay width={dimensions.width} height={dimensions.height} gridSize={gridSize} gridType={gridType} />
        
        {/* Token layer - static in relation to the map */}
        <TokenLayer />
      </div>

      {/* Roll20-style Action Bar (Left Side) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
        <div className="glass-panel rounded-lg flex flex-col items-center shadow-xl">
          {actionBarSections.map((section, sectionIndex) => <div key={`section-${sectionIndex}`} className="w-full">
              {/* Section header */}
              {sectionIndex > 0 && <div className="px-2 py-1 text-xs uppercase text-center font-semibold bg-primary/10 border-t border-b border-white/10">
                  {section.title}
                </div>}
              
              {/* Section tools */}
              <div className="flex flex-col items-center py-1">
                {section.items.map(item => <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button onClick={() => handleToolSelect(item.id)} className={`w-10 h-10 flex items-center justify-center transition-colors ${selectedTool === item.id ? 'bg-primary/30 text-primary-foreground' : 'hover:bg-white/10 text-foreground/80'}`} aria-label={item.tooltip}>
                        {item.icon}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="glass-panel">
                      {item.tooltip}
                    </TooltipContent>
                  </Tooltip>)}
              </div>
            </div>)}
        </div>
      </div>

      {/* Roll20-style Zoom Control Panel - now controls OpenLayers map */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="glass-panel rounded-lg flex flex-col items-center overflow-hidden">
          {/* Zoom percentage display - now shows OpenLayers zoom */}
          <div className="bg-secondary/80 w-10 h-10 flex items-center justify-center text-sm font-medium border-b border-white/10">
            {olMap ? currentMapZoom : 3}
          </div>
          
          {/* Zoom in button - now zooms OpenLayers map */}
          <button onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label="Zoom in">
            +
          </button>
          
          {/* Interactive Zoom slider - now controls OpenLayers map zoom */}
          <div className="py-3 px-4 h-20 flex items-center">
            <Slider 
              orientation="vertical" 
              value={[zoomToSliderValue(currentMapZoom)]} 
              onValueChange={handleZoomSliderChange} 
              max={100} 
              step={1} 
              className="h-16 w-5" 
            />
          </div>
          
          {/* Zoom out button - now zooms OpenLayers map */}
          <button onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label="Zoom out">
            -
          </button>
          
          {/* Focus/target button */}
          <button onClick={handleFocusSelected} disabled={!selectedTokenId} className={`w-10 h-10 flex items-center justify-center border-t border-white/10
              ${selectedTokenId ? 'hover:bg-primary/20 text-primary' : 'text-muted-foreground opacity-50'}
              transition-colors`} aria-label="Focus on selected token">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              <line x1="12" x2="12" y1="2" y2="4" />
              <line x1="12" x2="12" y1="20" y2="22" />
              <line x1="4" x2="2" y1="12" y2="12" />
              <line x1="22" x2="20" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Map info and status */}
      <div className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-lg text-sm">
        <div className="font-semibold">Battle Map</div>
        <div className="text-xs text-muted-foreground">Zoom: {currentMapZoom}x</div>
      </div>
    </div>;
};

export default Map;
