import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Style, Icon } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Geometry } from 'ol/geom';

/**
 * Types for ship features and properties
 */
export interface ShipProperties {
  isPlayer: boolean;
  sidc: string;
  heading?: number;
  speed?: number;
  designation?: string;
  [key: string]: unknown;
}

/**
 * Placeholder for the generateMilStdSymbol function that will be implemented in US5.5
 * This creates a simple SVG representation of a ship based on the SIDC code
 * @param symbolCode The MIL-STD-2525D symbol code
 * @param options Additional options for the symbol
 * @returns SVG string representation of the symbol
 */
export function generateMilStdSymbol(
  symbolCode: string = 'SFGPUCR----K', 
  options: {
    size?: number;
    fillColor?: string;
    strokeColor?: string;
    heading?: number;
    [key: string]: unknown;
  } = {}
): string {
  // Default options
  const {
    size = 32,
    fillColor = '#3366CC',
    strokeColor = '#000000',
    heading = 0,
  } = options;

  // Extract affiliation from SIDC (position 2)
  // F: Friend, H: Hostile, N: Neutral, U: Unknown, etc.
  const affiliation = symbolCode.charAt(1) || 'F';
  
  // Determine color based on affiliation
  let color = fillColor;
  switch (affiliation) {
    case 'F': // Friend
      color = '#3366CC'; // Blue
      break;
    case 'H': // Hostile
      color = '#CC3333'; // Red
      break;
    case 'N': // Neutral
      color = '#33CC33'; // Green
      break;
    case 'U': // Unknown
      color = '#CCCC33'; // Yellow
      break;
    default:
      color = fillColor;
  }

  // Create a simple ship shape as SVG
  // This is a placeholder until the actual MIL-STD-2525D implementation
  const halfSize = size / 2;
  const rotationTransform = `rotate(${heading} ${halfSize} ${halfSize})`;
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <g transform="${rotationTransform}">
        <polygon 
          points="${halfSize},${halfSize - halfSize * 0.8} ${halfSize - halfSize * 0.5},${halfSize + halfSize * 0.8} ${halfSize + halfSize * 0.5},${halfSize + halfSize * 0.8}"
          fill="${color}" 
          stroke="${strokeColor}" 
          stroke-width="1" 
        />
      </g>
    </svg>
  `;
}

/**
 * ShipService - Handles ship creation, movement, and styling
 */
export class ShipService {
  private ships: Map<string, Feature<Point>> = new Map();
  private shipLayer: VectorLayer<VectorSource> | null = null;

  /**
   * Create a ship feature
   * @param coordinates [longitude, latitude] coordinates
   * @param isPlayer Whether this is the player's ship
   * @param sidc Standard Identity Code (MIL-STD-2525D)
   * @param properties Additional properties for the ship
   * @returns OpenLayers Feature representing the ship
   */
  public createShip(
    coordinates: [number, number],
    isPlayer: boolean = false,
    sidc: string = 'SFGPUCR----K',
    properties: Partial<ShipProperties> = {}
  ): Feature<Point> {
    // Create a point geometry at the specified coordinates
    const point = new Point(fromLonLat(coordinates));
    
    // Create a feature with the point geometry
    const shipFeature = new Feature<Point>({
      geometry: point
    });
    
    // Set properties on the feature
    const shipProperties: ShipProperties = {
      isPlayer,
      sidc,
      heading: 0,
      speed: 0,
      ...properties
    };
    
    // Set the properties on the feature
    Object.entries(shipProperties).forEach(([key, value]) => {
      shipFeature.set(key, value);
    });
    
    // Generate the SVG symbol for the ship
    const svgString = generateMilStdSymbol(sidc, {
      fillColor: isPlayer ? '#3366CC' : '#CC3333', // Blue for player, red for others
      heading: shipProperties.heading,
      size: isPlayer ? 40 : 32, // Make player ship slightly larger
    });
    
    // Create a data URL from the SVG string
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    
    // Create a style for the ship
    const shipStyle = new Style({
      image: new Icon({
        src: svgUrl,
        scale: 1,
        rotation: (shipProperties.heading || 0) * Math.PI / 180, // Convert degrees to radians
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction'
      })
    });
    
    // Set the style on the feature
    shipFeature.setStyle(shipStyle);
    
    // Store the ship in our internal map
    const id = `ship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    shipFeature.setId(id);
    this.ships.set(id, shipFeature);
    
    return shipFeature;
  }

  /**
   * Move a ship to new coordinates
   * @param shipFeature The ship feature to move
   * @param coordinates New [longitude, latitude] coordinates
   */
  public moveShip(shipFeature: Feature<Point>, coordinates: [number, number]): void {
    const geometry = shipFeature.getGeometry();
    if (geometry) {
      geometry.setCoordinates(fromLonLat(coordinates));
    }
  }

  /**
   * Set the heading of a ship
   * @param shipFeature The ship feature to update
   * @param heading New heading in degrees (0-359)
   */
  public setShipHeading(shipFeature: Feature<Point>, heading: number): void {
    // Normalize heading to 0-359 range
    const normalizedHeading = ((heading % 360) + 360) % 360;
    
    // Update the heading property
    shipFeature.set('heading', normalizedHeading);
    
    // Get the current style
    const currentStyle = shipFeature.getStyle() as Style;
    if (!currentStyle) return;
    
    // Get the current icon
    const currentIcon = currentStyle.getImage() as Icon;
    if (!currentIcon) return;
    
    // Create a new icon with the updated rotation
    const newIcon = new Icon({
      src: currentIcon.getSrc(),
      scale: currentIcon.getScale(),
      rotation: normalizedHeading * Math.PI / 180, // Convert degrees to radians
      anchor: currentIcon.getAnchor(),
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction'
    });
    
    // Create a new style with the updated icon
    const newStyle = new Style({
      image: newIcon
    });
    
    // Set the new style on the feature
    shipFeature.setStyle(newStyle);
    
    // Regenerate the SVG with the new heading
    this.updateShipStyle(shipFeature);
  }

  /**
   * Update the style of a ship based on its properties
   * @param shipFeature The ship feature to update
   */
  private updateShipStyle(shipFeature: Feature<Point>): void {
    // Get the properties from the feature
    const isPlayer = shipFeature.get('isPlayer') as boolean;
    const sidc = shipFeature.get('sidc') as string;
    const heading = shipFeature.get('heading') as number || 0;
    
    // Generate the SVG symbol for the ship
    const svgString = generateMilStdSymbol(sidc, {
      fillColor: isPlayer ? '#3366CC' : '#CC3333', // Blue for player, red for others
      heading: heading,
      size: isPlayer ? 40 : 32, // Make player ship slightly larger
    });
    
    // Create a data URL from the SVG string
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    
    // Create a style for the ship
    const shipStyle = new Style({
      image: new Icon({
        src: svgUrl,
        scale: 1,
        rotation: heading * Math.PI / 180, // Convert degrees to radians
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction'
      })
    });
    
    // Set the style on the feature
    shipFeature.setStyle(shipStyle);
  }

  /**
   * Create a vector layer for ships and add it to the map
   * @returns VectorLayer for ships
   */
  public createShipLayer(): VectorLayer<VectorSource> {
    // Create a vector source
    const source = new VectorSource();
    
    // Create a vector layer
    this.shipLayer = new VectorLayer({
      source: source,
      zIndex: 10, // Ensure ships are drawn above the base map
    });
    
    return this.shipLayer;
  }

  /**
   * Add a ship feature to the ship layer
   * @param shipFeature The ship feature to add
   */
  public addShipToLayer(shipFeature: Feature<Point>): void {
    if (!this.shipLayer) {
      this.createShipLayer();
    }
    
    const source = this.shipLayer?.getSource();
    if (source) {
      source.addFeature(shipFeature);
    }
  }

  /**
   * Get all ships
   * @returns Array of ship features
   */
  public getAllShips(): Feature<Point>[] {
    return Array.from(this.ships.values());
  }

  /**
   * Get a ship by ID
   * @param id Ship ID
   * @returns Ship feature or undefined if not found
   */
  public getShipById(id: string): Feature<Point> | undefined {
    return this.ships.get(id);
  }

  /**
   * Remove a ship
   * @param shipFeature The ship feature to remove
   */
  public removeShip(shipFeature: Feature<Point>): void {
    const id = shipFeature.getId() as string;
    this.ships.delete(id);
    
    const source = this.shipLayer?.getSource();
    if (source) {
      source.removeFeature(shipFeature);
    }
  }
}

// Create a singleton instance
const shipService = new ShipService();
export default shipService;