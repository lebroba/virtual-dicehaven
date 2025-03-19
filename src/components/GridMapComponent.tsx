import React, { useState, useEffect, useRef } from "react";
import { useMapGridSystem } from "@/hooks/useMapGridSystem";
import { MapConfig, GridCellData } from "@/types/MapGridSystem";
import { useGame } from "@/context/GameContext";
import TokenLayer from "./TokenLayer";
import { useUnitContext } from "@/context/UnitContext";
import { toast } from "sonner";

interface GridMapComponentProps {
  width: number;
  height: number;
}

const GridMapComponent: React.FC<GridMapComponentProps> = ({ width, height }) => {
  const mapGridSystem = useMapGridSystem();
  const { gridSize, gridType } = useGame();
  const { units } = useUnitContext();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [gridCells, setGridCells] = useState<GridCellData[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the map when the component mounts
  useEffect(() => {
    const defaultMapConfig: MapConfig = {
      gridSizeX: Math.ceil(width / gridSize),
      gridSizeY: Math.ceil(height / gridSize),
      cellSize: gridSize,
      initialZoom: 1,
      initialCenterLat: 0,
      initialCenterLon: 0,
      terrainTypes: [
        { id: 1, name: "Deep Water", movementCost: 1, visualRepresentation: "#1e40af" },
        { id: 2, name: "Shallow Water", movementCost: 2, visualRepresentation: "#3b82f6" },
        { id: 3, name: "Shore", movementCost: 3, visualRepresentation: "#f0e68c" },
        { id: 4, name: "Grassland", movementCost: 1, visualRepresentation: "#4ade80" },
        { id: 5, name: "Forest", movementCost: 3, visualRepresentation: "#166534" },
        { id: 6, name: "Mountain", movementCost: 5, visualRepresentation: "#78716c" },
      ]
    };

    mapGridSystem.initialize(defaultMapConfig);
    
    // Generate some terrain for visualization
    generateTerrain();
    
    // Load sample DEM data
    const dummyDemData = new ArrayBuffer(1);
    mapGridSystem.loadDEM(dummyDemData).catch(err => {
      console.error("Failed to load DEM data:", err);
    });
    
    toast.success("Grid map initialized");
  }, []);

  // Update grid cells whenever we need to refresh the view
  useEffect(() => {
    setGridCells(mapGridSystem.getVisibleGridCells());
  }, [mapGridSystem]);

  // Generate some random terrain for visualization
  const generateTerrain = () => {
    try {
      const config = mapGridSystem.getMapConfig();
      
      for (let y = 0; y < config.gridSizeY; y++) {
        for (let x = 0; x < config.gridSizeX; x++) {
          // Create a simple terrain pattern
          let terrainType = 1; // Default to deep water
          
          // Generate some simple terrain patterns
          const distanceFromCenter = Math.sqrt(
            Math.pow(x - config.gridSizeX / 2, 2) + 
            Math.pow(y - config.gridSizeY / 2, 2)
          );
          
          if (distanceFromCenter < config.gridSizeX / 4) {
            // Central land mass
            if (distanceFromCenter < config.gridSizeX / 8) {
              terrainType = 6; // Mountains in center
            } else {
              terrainType = 5; // Forest
            }
          } else if (distanceFromCenter < config.gridSizeX / 3) {
            terrainType = 4; // Grassland
          } else if (distanceFromCenter < config.gridSizeX / 2.5) {
            terrainType = 3; // Shore
          } else if (distanceFromCenter < config.gridSizeX / 2) {
            terrainType = 2; // Shallow water
          }
          
          // Add some randomness
          if (Math.random() < 0.2) {
            terrainType = Math.max(1, Math.min(6, terrainType + (Math.random() > 0.5 ? 1 : -1)));
          }
          
          // Add some obstacles randomly
          const obstacle = Math.random() < 0.05;
          
          mapGridSystem.setGridCellData(x, y, {
            x, y,
            terrainType,
            obstacle,
            height: 0,
            extraData: {}
          });
        }
      }
    } catch (error) {
      console.error("Error generating terrain:", error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging the map with the middle mouse button or space+click
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (e.button === 0) {
      // Handle cell selection on left click
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / gridSize);
      const y = Math.floor((e.clientY - rect.top) / gridSize);
      
      try {
        const config = mapGridSystem.getMapConfig();
        if (x >= 0 && x < config.gridSizeX && y >= 0 && y < config.gridSizeY) {
          mapGridSystem.selectGridCell(x, y);
          setSelectedCell({ x, y });
          
          const cellData = mapGridSystem.getGridCellData(x, y);
          if (!('errorCode' in cellData)) {
            const terrainType = mapGridSystem.getTerrainType(x, y);
            if (!('errorCode' in terrainType)) {
              toast.info(`Selected: ${terrainType.name} (${x}, ${y})`);
            }
          }
        }
      } catch (error) {
        console.error("Error selecting cell:", error);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      mapGridSystem.panMap(deltaX, deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const currentZoom = 1; // Get this from mapGridSystem in a real implementation
    const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.5), 3);
    mapGridSystem.zoomMap(newZoom);
  };

  // Render the grid map
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
      {/* Render grid cells */}
      <div className="absolute inset-0">
        {gridCells.map((cell) => {
          // Get the terrain type for this cell
          const terrainType = mapGridSystem.getTerrainType(cell.x, cell.y);
          const color = !('errorCode' in terrainType) 
            ? terrainType.visualRepresentation 
            : '#ccc';
          
          const isSelected = selectedCell?.x === cell.x && selectedCell?.y === cell.y;
          
          return (
            <div
              key={`cell-${cell.x}-${cell.y}`}
              className={`absolute ${
                isSelected ? 'ring-2 ring-white ring-opacity-70' : ''
              } ${cell.obstacle ? 'border-2 border-red-500' : ''}`}
              style={{
                left: cell.x * gridSize,
                top: cell.y * gridSize,
                width: gridSize,
                height: gridSize,
                backgroundColor: color,
                opacity: 0.8,
                transition: 'background-color 0.3s',
              }}
              title={`Grid (${cell.x}, ${cell.y})`}
            />
          );
        })}
      </div>

      {/* Token layer */}
      <TokenLayer />
      
      {/* Units are now rendered by the GameUnits component in the CommandCenter */}
      
      {/* Show grid coordinates for debugging */}
      <div className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-lg text-sm">
        <div className="font-semibold">Tactical Grid</div>
        <div className="text-xs text-muted-foreground">
          {selectedCell 
            ? `Selected: (${selectedCell.x}, ${selectedCell.y})` 
            : 'Click to select a cell'}
        </div>
      </div>
    </div>
  );
};

export default GridMapComponent;
