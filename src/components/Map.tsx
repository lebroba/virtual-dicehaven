
import React, { useRef, useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import GridOverlay from "./GridOverlay";
import TokenLayer from "./TokenLayer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Layers, Hand, PenTool, Ruler, Dice1, Settings, MousePointer, PaintBucket, Eye, EyeOff, Map as MapIcon, Grid3x3, Puzzle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { type Map as OLMap, View } from 'ol';
import { fromLonLat, toLonLat } from 'ol/proj';
import { DragPan, MouseWheelZoom } from 'ol/interaction';

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
    tokens,
    selectedTool,
    setSelectedTool
  } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragPanRef = useRef<DragPan | null>(null); // Store the DragPan interaction
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1000,
    height: 800
  });
  const [gridDimensions, setGridDimensions] = useState({
    width: 0,
    height: 0
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [backgroundImage, setBackgroundImage] = useState("/placeholder.svg");
  const [visibleLayers, setVisibleLayers] = useState({
    map: true,
    grid: true,
    tokens: true
  });

  // Sample background images to choose from
  const sampleBackgrounds = [
    "/placeholder.svg",
    "https://images.unsplash.com/photo-1585202900225-6d3ac20a6962?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop"
  ];

  // Update container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        setContainerDimensions({ width, height });
      });
      resizeObserver.observe(containerRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Add OpenLayers interactions and sync grid with map
  useEffect(() => {
    if (!containerRef.current || !olMap) return;

    const view = olMap.getView();
    if (!view) return; // Add null check for view

    // DragPan for panning
    const dragPan = new DragPan({
      condition: (event) => {
        // Default condition: require Shift + left mouse button
        return event.originalEvent.button === 0 && (selectedTool === 'pan' || event.originalEvent.shiftKey);
      },
    });
    dragPan.setActive(true);
    dragPan.set('target', containerRef.current);
    dragPan.set('view', view);
    olMap.addInteraction(dragPan);
    dragPanRef.current = dragPan; // Store the interaction in a ref

    // MouseWheelZoom for zooming
    const mouseWheelZoom = new MouseWheelZoom();
    mouseWheelZoom.setActive(!disableMapZoom);
    mouseWheelZoom.set('target', containerRef.current);
    mouseWheelZoom.set('view', view);
    olMap.addInteraction(mouseWheelZoom);

    // Function to update grid dimensions, position, and scale
    const updateGrid = () => {
      if (!containerRef.current || !olMap || !view) return;

      try {
        const mapSize = olMap.getSize();
        // Add proper null checks
        if (!mapSize) {
          console.warn("Map size is not available yet");
          return;
        }

        // Get the map's visible extent in map coordinates
        const extent = view.calculateExtent(mapSize);
        if (!extent || extent.length < 4) {
          console.warn("Map extent is not valid");
          return;
        }

        const [minX, minY, maxX, maxY] = extent;

        // Convert extent to pixel dimensions
        const resolution = view.getResolution() || 1;
        const widthInPixels = (maxX - minX) / resolution;
        const heightInPixels = (maxY - minY) / resolution;
        setGridDimensions({
          width: widthInPixels,
          height: heightInPixels
        });

        // Get the map's center in map coordinates
        const center = view.getCenter();
        if (!center) {
          console.warn("Map center is not available");
          return;
        }

        const centerPixel = olMap.getPixelFromCoordinate(center);
        if (!centerPixel || centerPixel.length < 2) {
          console.warn("Could not convert center to pixel coordinates");
          return;
        }

        // Calculate the offset to align the grid with the map's center
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const offsetX = centerPixel[0] - containerWidth / 2;
        const offsetY = centerPixel[1] - containerHeight / 2;

        setPosition({
          x: -offsetX,
          y: -offsetY
        });

        // Calculate the scale based on the zoom level
        const zoom = view.getZoom() || 3;
        const baseZoom = 3; // The zoom level where scale = 1
        const scaleFactor = Math.pow(2, zoom - baseZoom);
        setScale(scaleFactor);
      } catch (error) {
        console.error("Error updating grid:", error);
      }
    };

    // Initial update
    updateGrid();

    // Listen for view changes
    view.on('change:resolution', updateGrid); // Zoom changes
    view.on('change:center', updateGrid); // Panning changes

    // Listen for zoom changes to update CommandCenter's state
    if (onZoomChange) {
      view.on('change:resolution', () => {
        const newZoom = view.getZoom();
        if (newZoom !== undefined) {
          onZoomChange(newZoom);
        }
      });
    }

    return () => {
      // Clean up listeners and interactions
      try {
        if (olMap) {
          try {
            olMap.removeInteraction(dragPan);
            olMap.removeInteraction(mouseWheelZoom);
          } catch (err) {
            console.error("Error removing map interactions:", err);
          }
        }
        
        if (view) {
          view.un('change:resolution', updateGrid);
          view.un('change:center', updateGrid);
          if (onZoomChange) {
            view.un('change:resolution', () => {});
          }
        }
        
        dragPanRef.current = null;
      } catch (error) {
        console.error("Error cleaning up map interactions:", error);
      }
    };
  }, [olMap, disableMapZoom, onZoomChange, selectedTool]);

  // Update DragPan condition when selectedTool changes
  useEffect(() => {
    if (dragPanRef.current) {
      dragPanRef.current.set('condition', (event: any) => {
        // Allow panning with left mouse button if Pan Tool is selected, otherwise require Shift
        return event.originalEvent.button === 0 && (selectedTool === 'pan' || event.originalEvent.shiftKey);
      });
    }
  }, [selectedTool]);

  // Handle zoom in control
  const handleZoomIn = () => {
    if (olMap && olMap.getView()) {
      const currentZoom = olMap.getView().getZoom() || 3;
      const newZoom = Math.min(currentZoom + 1, 19);
      
      // Animate zoom
      olMap.getView().animate({
        zoom: newZoom,
        duration: 250,
        easing: (t) => t
      });
      
      if (onZoomChange) onZoomChange(newZoom);
    }
  };

  // Handle zoom out control
  const handleZoomOut = () => {
    if (olMap && olMap.getView()) {
      const currentZoom = olMap.getView().getZoom() || 3;
      const newZoom = Math.max(currentZoom - 1, 0);
      
      // Animate zoom
      olMap.getView().animate({
        zoom: newZoom,
        duration: 250,
        easing: (t) => t
      });
      
      if (onZoomChange) onZoomChange(newZoom);
    }
  };

  // Handle zoom slider change
  const handleZoomSliderChange = (value: number[]) => {
    if (olMap && onZoomChange) {
      const newZoom = sliderValueToZoom(value[0]);
      
      // Animate zoom smoothly
      olMap.getView().animate({
        zoom: newZoom,
        duration: 150
      });
      
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
  const zoomToSliderValue = (zoomValue: number) => {
    return (zoomValue / 19) * 100;
  };

  // Calculate the OpenLayers zoom from slider value
  const sliderValueToZoom = (sliderValue: number) => {
    return (sliderValue / 100) * 19;
  };

  // Handle center view with animation
  const handleCenterView = () => {
    if (olMap) {
      // Animate the view to the default center and zoom
      olMap.getView().animate({
        center: fromLonLat([30.5, 45.8]),
        zoom: 3,
        duration: 500,
        easing: (t) => {
          // Ease out cubic function for smooth animation
          return --t * t * t + 1;
        }
      });
      
      if (onZoomChange) {
        // Wait until animation is complete to update the zoom control
        setTimeout(() => {
          onZoomChange(3);
        }, 500);
      }
    }
  };

  // Direction panning functions with dynamic distance calculation
  const handlePanDirection = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!olMap) return;
    
    const view = olMap.getView();
    const currentCenter = view.getCenter() || [0, 0];
    const resolution = view.getResolution() || 1;
    
    let newCenter = [...currentCenter];
    
    // Calculate pan distance based on current zoom level and view size
    if (containerRef.current) {
      const viewportWidth = containerRef.current.clientWidth;
      const viewportHeight = containerRef.current.clientHeight;
      
      // Use 20% of viewport size for panning distance
      const horizontalPan = viewportWidth * 0.2 * resolution;
      const verticalPan = viewportHeight * 0.2 * resolution;
      
      switch(direction) {
        case 'left':
          newCenter[0] -= horizontalPan;
          break;
        case 'right':
          newCenter[0] += horizontalPan;
          break;
        case 'up':
          newCenter[1] += verticalPan;
          break;
        case 'down':
          newCenter[1] -= verticalPan;
          break;
      }
    } else {
      // Fallback if containerRef is not available
      const distance = 200 / resolution;
      switch(direction) {
        case 'left':
          newCenter[0] -= distance;
          break;
        case 'right':
          newCenter[0] += distance;
          break;
        case 'up':
          newCenter[1] += distance;
          break;
        case 'down':
          newCenter[1] -= distance;
          break;
      }
    }
    
    // Animate the pan with easing
    view.animate({
      center: newCenter,
      duration: 250,
      easing: (t) => {
        // Ease out cubic function: acceleration then deceleration
        return --t * t * t + 1;
      }
    });
    
    // Force grid update after animation
    setTimeout(() => {
      if (olMap) {
        olMap.updateSize();
        olMap.render();
      }
    }, 300);
  };

  // Find and center on the selected token
  const handleFocusSelected = () => {
    if (!selectedTokenId || !containerRef.current || !olMap) return;
    const selectedToken = tokens.find(token => token.id === selectedTokenId);
    if (!selectedToken) return;

    // Calculate the center position of the container
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // This is a simplified approach - in a real app, you would convert token coordinates to map coordinates
    const x = selectedToken.x / containerWidth;
    const y = selectedToken.y / containerHeight;

    // Since we don't have proper geo-coordinates for tokens, we'll just zoom in slightly
    const currentCenter = olMap.getView().getCenter() || [0, 0];
    const currentZoom = olMap.getView().getZoom() || 3;
    const newZoom = Math.min(currentZoom + 1, 19);
    
    // Animate to the token with a smooth transition
    olMap.getView().animate({
      center: currentCenter,
      zoom: newZoom,
      duration: 300,
      easing: (t) => {
        // Ease out cubic
        return --t * t * t + 1;
      }
    });

    if (onZoomChange) {
      setTimeout(() => {
        onZoomChange(newZoom);
      }, 300);
    }
  };

  // Change the selected tool
  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    console.log(`Selected tool: ${tool}`);
    
    // If selecting pan tool, give visual feedback that map panning is active
    if (tool === 'pan' && containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    } else if (containerRef.current) {
      containerRef.current.style.cursor = 'default';
    }
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  // Change the background image
  const handleChangeBackground = () => {
    const currentIndex = sampleBackgrounds.indexOf(backgroundImage);
    const nextIndex = (currentIndex + 1) % sampleBackgrounds.length;
    setBackgroundImage(sampleBackgrounds[nextIndex]);
  };

  // Action bar tools configuration
  const tools = [
    { id: 'select', icon: <MousePointer size={20} />, tooltip: 'Select Tool' },
    { id: 'pan', icon: <Hand size={20} />, tooltip: 'Pan Tool' },
    { id: 'draw', icon: <PenTool size={20} />, tooltip: 'Drawing Tools' },
    { id: 'measure', icon: <Ruler size={20} />, tooltip: 'Measurement Tool' },
    { id: 'fill', icon: <PaintBucket size={20} />, tooltip: 'Fill Tool' },
    { id: 'dice', icon: <Dice1 size={20} />, tooltip: 'Roll Dice' }
  ];

  // Action bar sections
  const actionBarSections = [
    {
      title: 'Tools',
      items: tools
    },
    {
      title: 'Layers',
      items: [
        {
          id: 'map',
          icon: <MapIcon size={20} />,
          tooltip: 'Toggle Map Layer',
          onClick: () => toggleLayerVisibility('map')
        },
        {
          id: 'grid',
          icon: <Grid3x3 size={20} />,
          tooltip: 'Toggle Grid Layer',
          onClick: () => toggleLayerVisibility('grid')
        },
        {
          id: 'tokens',
          icon: <Puzzle size={20} />,
          tooltip: 'Toggle Token Layer',
          onClick: () => toggleLayerVisibility('tokens')
        }
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'settings', icon: <Settings size={20} />, tooltip: 'Settings' }
      ]
    }
  ];

  // Get the current zoom level to display
  const currentMapZoom = olMap && olMap.getView() ? Math.round((olMap.getView().getZoom() || 3) * 10) / 10 : 3;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-transparent rounded-lg"
      style={{ isolation: 'isolate' }} // Create a stacking context
    >
      {/* Use CSS Grid to manage layers more effectively */}
      <div className="grid grid-cols-1 grid-rows-1 w-full h-full">
        {/* Map layer */}
        <div 
          className="col-start-1 row-start-1 w-full h-full"
          style={{ 
            zIndex: 1,
            visibility: visibleLayers.map ? 'visible' : 'hidden'
          }}
        >
          {/* OpenLayers Map renders here */}
        </div>
        
        {/* Grid layer */}
        <div className="col-start-1 row-start-1 w-full h-full">
          <div
            className="absolute inset-0 pointer-events-none bg-transparent"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              width: gridDimensions.width,
              height: gridDimensions.height,
              zIndex: 5,
              visibility: visibleLayers.grid ? 'visible' : 'hidden'
            }}
          >
            <GridOverlay
              width={gridDimensions.width}
              height={gridDimensions.height}
              gridSize={gridSize}
              gridType={gridType}
            />
          </div>
        </div>
        
        {/* Token layer */}
        <div 
          className="col-start-1 row-start-1 w-full h-full"
          style={{
            zIndex: 10,
            visibility: visibleLayers.tokens ? 'visible' : 'hidden'
          }}
        >
          <TokenLayer />
        </div>
      </div>

      {/* Tool Action Bar (Left Side) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
        <div className="glass-panel rounded-lg flex flex-col items-center shadow-xl">
          {actionBarSections.map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`} className="w-full">
              {sectionIndex > 0 && (
                <div className="px-2 py-1 text-xs uppercase text-center font-semibold bg-primary/10 border-t border-b border-white/10">
                  {section.title}
                </div>
              )}
              <div className="flex flex-col items-center py-1">
                {section.items.map(item => (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => item.onClick ? item.onClick() : handleToolSelect(item.id)}
                        className={`w-10 h-10 flex items-center justify-center transition-colors ${
                          selectedTool === item.id ? 'bg-primary/30 text-primary-foreground' : 'hover:bg-white/10 text-foreground/80'
                        }`}
                        aria-label={item.tooltip}
                      >
                        {item.icon}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="glass-panel">
                      {item.tooltip}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Controls Panel */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
        <div className="glass-panel rounded-lg flex flex-col items-center overflow-hidden">
          <div className="bg-secondary/80 w-full py-1 flex items-center justify-center text-sm font-medium border-b border-white/10">
            {olMap ? currentMapZoom : 3}
          </div>
          
          {/* Pan Directional Controls */}
          <div className="grid grid-cols-3 w-full">
            <button
              onClick={() => handlePanDirection('left')}
              className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="Pan left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18" />
                <path d="M3 12l6 6" />
                <path d="M3 12l6-6" />
              </svg>
            </button>
            <button
              onClick={handleCenterView}
              className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="Center view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </button>
            <button
              onClick={() => handlePanDirection('right')}
              className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="Pan right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18" />
                <path d="M15 6l6 6" />
                <path d="M15 18l6-6" />
              </svg>
            </button>
            <button
              onClick={() => handlePanDirection('up')}
              className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="Pan up"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M6 3l6 6" />
                <path d="M18 3l-6 6" />
              </svg>
            </button>
            <div></div>
            <button
              onClick={() => handlePanDirection('down')}
              className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="Pan down"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M18 21l-6-6" />
                <path d="M6 21l6-6" />
              </svg>
            </button>
          </div>
          
          {/* Divider */}
          <div className="border-t border-white/10 w-full my-1"></div>
          
          {/* Zoom Controls */}
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            aria-label="Zoom in"
          >
            +
          </button>
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
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            aria-label="Zoom out"
          >
            -
          </button>
          
          {/* Token Focus Button */}
          <button
            onClick={handleFocusSelected}
            disabled={!selectedTokenId}
            className={`w-10 h-10 flex items-center justify-center border-t border-white/10
              ${selectedTokenId ? 'hover:bg-primary/20 text-primary' : 'text-muted-foreground opacity-50'}
              transition-colors`}
            aria-label="Focus on selected token"
          >
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
      <div className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-lg text-sm z-20">
        <div className="font-semibold">Battle Map</div>
        <div className="text-xs text-muted-foreground">Zoom: {currentMapZoom}x</div>
      </div>
    </div>
  );
};

export default Map;
