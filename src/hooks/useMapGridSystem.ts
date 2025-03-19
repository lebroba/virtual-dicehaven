import { useState, useRef, useEffect } from 'react';
import { MapConfig, GridCellData, TerrainType, ErrorResponse, MapGridSystem } from '@/types/MapGridSystem';
import { toast } from 'sonner';

// A simple A* implementation for pathfinding
// In a production app, we would use a proper library like javascript-astar
class AStarGraph {
  grid: number[][];
  
  constructor(grid: number[][]) {
    this.grid = grid;
  }

  findPath(startX: number, startY: number, endX: number, endY: number): { x: number, y: number }[] {
    // Simple implementation for demo purposes
    // A proper implementation would use the A* algorithm
    const path: { x: number, y: number }[] = [];
    let currentX = startX;
    let currentY = startY;
    
    // Simple direct path (not using obstacles yet)
    while (currentX !== endX || currentY !== endY) {
      if (currentX < endX) currentX++;
      else if (currentX > endX) currentX--;
      
      if (currentY < endY) currentY++;
      else if (currentY > endY) currentY--;
      
      path.push({ x: currentX, y: currentY });
    }
    
    return path;
  }
}

export const useMapGridSystem = (): MapGridSystem => {
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [gridData, setGridData] = useState<GridCellData[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const astarRef = useRef<AStarGraph | null>(null);

  // Initialize the map with the given configuration
  const initialize = (config: MapConfig) => {
    setMapConfig(config);
    
    // Create an empty grid based on the config sizes
    const newGridData: GridCellData[][] = Array.from({ length: config.gridSizeY }, (_, y) =>
      Array.from({ length: config.gridSizeX }, (_, x) => ({
        x,
        y,
        terrainType: 1, // Default terrain type ID
        obstacle: false,
        height: 0,
      }))
    );
    
    setGridData(newGridData);
    setZoomLevel(config.initialZoom);
    
    // Initialize A* grid for pathfinding
    const astarGrid = newGridData.map(row => 
      row.map(cell => cell.obstacle ? 0 : 1)
    );
    astarRef.current = new AStarGraph(astarGrid);
    
    toast.success("Map initialized successfully");
  };

  // Load Digital Elevation Model data
  const loadDEM = async (demData: ArrayBuffer): Promise<void> => {
    if (!mapConfig) {
      toast.error("Map not initialized");
      return Promise.reject("Map not initialized");
    }
    
    try {
      // In a real implementation, we would parse the DEM data
      // and update the grid heights accordingly
      
      // For this demo, we'll just simulate loading DEM data
      const newGridData = [...gridData];
      
      // Simulate varying heights based on position
      for (let y = 0; y < mapConfig.gridSizeY; y++) {
        for (let x = 0; x < mapConfig.gridSizeX; x++) {
          // Create some hills and valleys for visualization
          const height = Math.sin(x / 30) * Math.cos(y / 30) * 100;
          newGridData[y][x] = { ...newGridData[y][x], height };
        }
      }
      
      setGridData(newGridData);
      toast.success("DEM data loaded successfully");
      return Promise.resolve();
    } catch (error) {
      toast.error("Failed to load DEM data");
      return Promise.reject(error);
    }
  };

  // Set bathymetry data for underwater terrain
  const setBathymetryData = (bathymetryData: ArrayBuffer): void => {
    // For this demo, we'll just simulate setting bathymetry data
    toast.info("Bathymetry data loading not implemented in this demo");
  };

  // Convert grid coordinates to latitude/longitude
  const gridToLatLon = (gridX: number, gridY: number): { lat: number; lon: number } | ErrorResponse => {
    if (!mapConfig) return { errorCode: 106, errorMessage: 'Map not initialized.' };
    
    if (gridX < 0 || gridX >= mapConfig.gridSizeX || gridY < 0 || gridY >= mapConfig.gridSizeY) {
      return { errorCode: 100, errorMessage: 'Invalid grid coordinates.' };
    }
    
    // Simplified conversion (in a real app, we'd use proper projection)
    const lat = mapConfig.initialCenterLat + 
      (gridY - mapConfig.gridSizeY / 2) * (mapConfig.cellSize / 111000); // 111km per degree latitude
    
    const lon = mapConfig.initialCenterLon + 
      (gridX - mapConfig.gridSizeX / 2) * (mapConfig.cellSize / (111000 * Math.cos(mapConfig.initialCenterLat * Math.PI / 180)));
    
    return { lat, lon };
  };

  // Convert latitude/longitude to grid coordinates
  const latLonToGrid = (lat: number, lon: number): { x: number; y: number } | ErrorResponse => {
    if (!mapConfig) return { errorCode: 106, errorMessage: 'Map not initialized.' };
    
    // Simplified conversion (in a real app, we'd use proper projection)
    const gridX = Math.round(
      (lon - mapConfig.initialCenterLon) * 
      (111000 * Math.cos(mapConfig.initialCenterLat * Math.PI / 180)) / 
      mapConfig.cellSize + mapConfig.gridSizeX / 2
    );
    
    const gridY = Math.round(
      (lat - mapConfig.initialCenterLat) * 111000 / 
      mapConfig.cellSize + mapConfig.gridSizeY / 2
    );
    
    if (gridX < 0 || gridX >= mapConfig.gridSizeX || gridY < 0 || gridY >= mapConfig.gridSizeY) {
      return { errorCode: 101, errorMessage: 'Invalid latitude/longitude coordinates.' };
    }
    
    return { x: gridX, y: gridY };
  };

  // Get data for a specific grid cell
  const getGridCellData = (gridX: number, gridY: number): GridCellData | ErrorResponse => {
    if (!mapConfig) return { errorCode: 106, errorMessage: 'Map not initialized.' };
    
    if (gridX < 0 || gridX >= mapConfig.gridSizeX || gridY < 0 || gridY >= mapConfig.gridSizeY) {
      return { errorCode: 100, errorMessage: 'Invalid grid coordinates.' };
    }
    
    return gridData[gridY][gridX];
  };

  // Update data for a specific grid cell
  const setGridCellData = (gridX: number, gridY: number, data: GridCellData): ErrorResponse => {
    if (!mapConfig) return { errorCode: 106, errorMessage: 'Map not initialized.' };
    
    if (gridX < 0 || gridX >= mapConfig.gridSizeX || gridY < 0 || gridY >= mapConfig.gridSizeY) {
      return { errorCode: 100, errorMessage: 'Invalid grid coordinates.' };
    }
    
    const newGridData = [...gridData];
    newGridData[gridY][gridX] = { ...data, x: gridX, y: gridY };
    setGridData(newGridData);
    
    // Update A* grid for pathfinding
    if (astarRef.current) {
      astarRef.current.grid = newGridData.map(row => 
        row.map(cell => cell.obstacle ? 0 : 1)
      );
    }
    
    return { errorCode: 0, errorMessage: '' }; // Success with no error
  };

  // Get the terrain type for a specific grid cell
  const getTerrainType = (gridX: number, gridY: number): TerrainType | ErrorResponse => {
    const cellData = getGridCellData(gridX, gridY);
    
    if ('errorCode' in cellData) return cellData;
    if (!mapConfig) return { errorCode: 106, errorMessage: 'Map not initialized.' };
    
    const terrainType = mapConfig.terrainTypes.find(t => t.id === cellData.terrainType);
    
    if (!terrainType) {
      return { errorCode: 108, errorMessage: 'Failed to retrieve Terrain Type.' };
    }
    
    return terrainType;
  };

  // Find a path between two grid cells
  const findPath = (startX: number, startY: number, endX: number, endY: number): { path: { x: number; y: number }[] } | ErrorResponse => {
    if (!mapConfig) return { errorCode: 106, errorMessage: 'Map not initialized.' };
    
    if (
      startX < 0 || startX >= mapConfig.gridSizeX || startY < 0 || startY >= mapConfig.gridSizeY ||
      endX < 0 || endX >= mapConfig.gridSizeX || endY < 0 || endY >= mapConfig.gridSizeY
    ) {
      return { errorCode: 100, errorMessage: 'Invalid grid coordinates.' };
    }
    
    try {
      if (!astarRef.current) {
        return { errorCode: 102, errorMessage: 'Path not found.' };
      }
      
      const path = astarRef.current.findPath(startX, startY, endX, endY);
      return { path };
    } catch (error) {
      console.error("Pathfinding error:", error);
      return { errorCode: 102, errorMessage: 'Path not found.' };
    }
  };

  // Pan the map by the specified delta
  const panMap = (deltaX: number, deltaY: number): void => {
    setMapPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  };

  // Set the zoom level of the map
  const zoomMap = (newZoomLevel: number): void => {
    setZoomLevel(newZoomLevel);
  };

  // Select a specific grid cell
  const selectGridCell = (gridX: number, gridY: number): void => {
    if (!mapConfig) {
      toast.error("Map not initialized");
      return;
    }
    
    if (gridX < 0 || gridX >= mapConfig.gridSizeX || gridY < 0 || gridY >= mapConfig.gridSizeY) {
      toast.error("Invalid grid coordinates");
      return;
    }
    
    setSelectedCell({ x: gridX, y: gridY });
    
    // In a real implementation, we might want to center the map on the selected cell
    // or trigger other UI updates
  };

  // Search for a location by name or coordinates
  const searchLocation = (query: string): { x: number; y: number } | { lat: number; lon: number } | ErrorResponse => {
    // In a real implementation, this would connect to a geocoding service
    // For this demo, we'll just handle a few hardcoded locations
    
    if (!mapConfig) return { errorCode: 106, errorMessage: 'Map not initialized.' };
    
    const locations: Record<string, { lat: number, lon: number }> = {
      "san francisco": { lat: 37.7749, lon: -122.4194 },
      "new york": { lat: 40.7128, lon: -74.0060 },
      "tokyo": { lat: 35.6762, lon: 139.6503 },
      "london": { lat: 51.5074, lon: -0.1278 }
    };
    
    const lowercaseQuery = query.toLowerCase();
    
    if (locations[lowercaseQuery]) {
      const result = latLonToGrid(locations[lowercaseQuery].lat, locations[lowercaseQuery].lon);
      if ('errorCode' in result) {
        return result;
      }
      return result;
    }
    
    // Try to parse as coordinates "lat,lon"
    const coordsMatch = query.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lon = parseFloat(coordsMatch[3]);
      
      if (isNaN(lat) || isNaN(lon)) {
        return { errorCode: 109, errorMessage: 'Search location not found.' };
      }
      
      return { lat, lon };
    }
    
    return { errorCode: 109, errorMessage: 'Search location not found.' };
  };

  // Get all visible grid cells based on current view
  const getVisibleGridCells = (): GridCellData[] => {
    if (!mapConfig || gridData.length === 0) return [];
    
    // In a real implementation, we would use the current pan and zoom
    // to determine which cells are visible in the viewport
    
    // For this demo, we'll just return all cells
    return gridData.flat();
  };

  // Get the current map configuration
  const getMapConfig = (): MapConfig => {
    if (!mapConfig) {
      throw new Error("Map not initialized");
    }
    return mapConfig;
  };

  return {
    initialize,
    loadDEM,
    setBathymetryData,
    gridToLatLon,
    latLonToGrid,
    getGridCellData,
    setGridCellData,
    getTerrainType,
    findPath,
    panMap,
    zoomMap,
    selectGridCell,
    searchLocation,
    getVisibleGridCells,
    getMapConfig,
  };
};
