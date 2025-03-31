
import { ShipEntity } from './ShipEntity';
import { cloneDeep } from 'lodash';

/**
 * More advanced factory for creating ship entities with batch operations
 */
export class ShipEntityFactory {
  private templates: Map<string, ShipEntity> = new Map();
  
  constructor() {
    // Initialize with default templates
    this.initializeDefaultTemplates();
  }
  
  /**
   * Initialize default ship templates
   */
  private initializeDefaultTemplates(): void {
    // Create base templates for different ship types
    const sloopTemplate = new ShipEntity(0, 0, 0, false, 'sloop');
    const frigateTemplate = new ShipEntity(0, 0, 0, false, 'frigate');
    const cutterTemplate = new ShipEntity(0, 0, 0, false, 'cutter');
    const manOfWarTemplate = new ShipEntity(0, 0, 0, false, 'man-of-war');
    
    // Store templates
    this.templates.set('sloop', sloopTemplate);
    this.templates.set('frigate', frigateTemplate);
    this.templates.set('cutter', cutterTemplate);
    this.templates.set('man-of-war', manOfWarTemplate);
  }
  
  /**
   * Register a custom ship template
   */
  registerTemplate(name: string, template: ShipEntity): void {
    this.templates.set(name, template);
  }
  
  /**
   * Create a ship based on a template
   */
  createFromTemplate(templateName: string, x: number = 0, y: number = 0, rotation: number = 0): ShipEntity {
    const template = this.templates.get(templateName);
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    // Create a deep copy of the template to avoid modifying the original
    const ship = ShipEntity.fromJSON(cloneDeep(template.toJSON()));
    
    // Update position and rotation
    ship.setPosition(x, y);
    ship.setRotation(rotation);
    
    return ship;
  }
  
  /**
   * Create multiple ships at once for better performance
   */
  createBatch(
    templateName: string,
    count: number,
    startX: number,
    startY: number,
    spacingX: number = 100,
    spacingY: number = 100
  ): ShipEntity[] {
    const ships: ShipEntity[] = [];
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 5); // 5 ships per row
      const col = i % 5;
      
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      ships.push(this.createFromTemplate(templateName, x, y));
    }
    
    return ships;
  }
  
  /**
   * Create a formation of ships
   */
  createFormation(
    templateName: string,
    formationType: 'line' | 'wedge' | 'circle',
    centerX: number,
    centerY: number,
    count: number,
    spacing: number = 100
  ): ShipEntity[] {
    const ships: ShipEntity[] = [];
    
    switch (formationType) {
      case 'line':
        // Create ships in a line formation
        for (let i = 0; i < count; i++) {
          const x = centerX + (i - Math.floor(count / 2)) * spacing;
          const y = centerY;
          const rotation = 0; // All facing the same direction
          
          ships.push(this.createFromTemplate(templateName, x, y, rotation));
        }
        break;
        
      case 'wedge':
        // Create ships in a wedge/V formation
        for (let i = 0; i < count; i++) {
          const isLeftSide = i < Math.floor(count / 2);
          const subIndex = isLeftSide ? i : i - Math.floor(count / 2);
          const angle = isLeftSide ? 135 : 45; // 135° for left side, 45° for right side
          const distance = subIndex * spacing;
          
          const x = centerX + distance * Math.cos(angle * Math.PI / 180);
          const y = centerY + distance * Math.sin(angle * Math.PI / 180);
          const rotation = isLeftSide ? -45 : 45; // Facing outward
          
          ships.push(this.createFromTemplate(templateName, x, y, rotation));
        }
        break;
        
      case 'circle':
        // Create ships in a circle formation
        const radius = spacing * count / (2 * Math.PI);
        
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * 2 * Math.PI;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const rotation = (angle * 180 / Math.PI) + 90; // Facing outward
          
          ships.push(this.createFromTemplate(templateName, x, y, rotation));
        }
        break;
    }
    
    return ships;
  }
}

// Export a singleton instance
export const shipFactory = new ShipEntityFactory();
