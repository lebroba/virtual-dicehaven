
export interface MapConfig {
  gridSizeX: number;
  gridSizeY: number;
  cellSize: number;
  initialZoom: number;
  initialCenterLat: number;
  initialCenterLon: number;
  terrainTypes: TerrainType[];
}

export interface TerrainType {
  id: number;
  name: string;
  movementCost: number;
  visualRepresentation: string;
}

export interface GridCellData {
  x: number;
  y: number;
  terrainType: number;
  obstacle: boolean;
  height: number;
  extraData?: any;
}

export interface ErrorResponse {
  errorCode: number;
  errorMessage: string;
}

export interface MapGridSystem {
  initialize(config: MapConfig): void;
  loadDEM(demData: ArrayBuffer): Promise<void>;
  setBathymetryData(bathymetryData: ArrayBuffer): void;
  gridToLatLon(gridX: number, gridY: number): { lat: number; lon: number } | ErrorResponse;
  latLonToGrid(lat: number, lon: number): { x: number; y: number } | ErrorResponse;
  getGridCellData(gridX: number, gridY: number): GridCellData | ErrorResponse;
  setGridCellData(gridX: number, gridY: number, data: GridCellData): ErrorResponse;
  getTerrainType(gridX: number, gridY: number): TerrainType | ErrorResponse;
  findPath(startX: number, startY: number, endX: number, endY: number): { path: { x: number; y: number }[] } | ErrorResponse;
  panMap(deltaX: number, deltaY: number): void;
  zoomMap(zoomLevel: number): void;
  selectGridCell(gridX: number, gridY: number): void;
  searchLocation(query: string): { x: number; y: number } | { lat: number; lon: number } | ErrorResponse;
  getVisibleGridCells(): GridCellData[];
  getMapConfig(): MapConfig;
}
