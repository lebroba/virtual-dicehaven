
import { EventEmitter } from 'events';
import { Entity } from './Entity';
import * as PIXI from 'pixi.js';

/**
 * Defines attributes for a ship entity
 */
export interface ShipAttributes {
  type: string;
  health: number;
  maxHealth: number;
  crew: number;
  maxCrew: number;
  speed: number;
  maxSpeed: number;
  maneuverability: number;
  cannonCount: number;
  flags: {
    isSinking: boolean;
    isOnFire: boolean;
    isDisabled: boolean;
  };
}

/**
 * Ship entity class representing a ship in the game
 */
export class ShipEntity extends Entity {
  vx: number;
  vy: number;
  isPlayer: boolean;
  attributes: ShipAttributes;
  events: EventEmitter;
  visibilityRange: number;

  constructor(
    x: number = 0, 
    y: number = 0, 
    rotation: number = 0, 
    isPlayer: boolean = false,
    shipType: string = 'sloop',
    id?: string
  ) {
    super(x, y, rotation, id);
    
    this.vx = 0;
    this.vy = 0;
    this.isPlayer = isPlayer;
    this.visibilityRange = 500; // Default visibility range in units
    
    // Initialize default ship attributes
    this.attributes = {
      type: shipType,
      health: 100,
      maxHealth: 100,
      crew: 50,
      maxCrew: 50,
      speed: 0,
      maxSpeed: 10,
      maneuverability: 5,
      cannonCount: 20,
      flags: {
        isSinking: false,
        isOnFire: false,
        isDisabled: false,
      }
    };

    // Setup event emitter
    this.events = new EventEmitter();
    // Increase max listeners to avoid warnings
    this.events.setMaxListeners(20);
    
    // Call the onCreate method
    this.onCreate();
  }

  /**
   * Override onCreate to initialize ship-specific properties
   */
  override onCreate(): void {
    super.onCreate();
    
    // Ship-specific initialization here
    this.initShipAttributes();
  }

  /**
   * Initialize ship attributes based on ship type
   */
  private initShipAttributes(): void {
    // Set attributes based on ship type
    switch (this.attributes.type.toLowerCase()) {
      case 'frigate':
        this.attributes.maxHealth = 200;
        this.attributes.maxCrew = 100;
        this.attributes.maxSpeed = 8;
        this.attributes.maneuverability = 3;
        this.attributes.cannonCount = 40;
        break;
      case 'man-of-war':
        this.attributes.maxHealth = 300;
        this.attributes.maxCrew = 150;
        this.attributes.maxSpeed = 6;
        this.attributes.maneuverability = 2;
        this.attributes.cannonCount = 80;
        break;
      case 'cutter':
        this.attributes.maxHealth = 80;
        this.attributes.maxCrew = 30;
        this.attributes.maxSpeed = 12;
        this.attributes.maneuverability = 8;
        this.attributes.cannonCount = 10;
        break;
      // Default is sloop
      default:
        this.attributes.maxHealth = 100;
        this.attributes.maxCrew = 50;
        this.attributes.maxSpeed = 10;
        this.attributes.maneuverability = 5;
        this.attributes.cannonCount = 20;
        break;
    }
    
    // Set current values to max values
    this.attributes.health = this.attributes.maxHealth;
    this.attributes.crew = this.attributes.maxCrew;
  }

  /**
   * Update ship's velocity based on current speed and rotation
   */
  updateVelocity(): void {
    // Convert rotation to radians (assuming rotation is in degrees)
    const radians = this.rotation * Math.PI / 180;
    
    // Calculate velocity components based on speed and direction
    this.vx = this.attributes.speed * Math.sin(radians);
    this.vy = -this.attributes.speed * Math.cos(radians); // Negative because y increases downwards
    
    // Emit move event
    this.events.emit('move', { x: this.x, y: this.y, vx: this.vx, vy: this.vy, rotation: this.rotation });
  }

  /**
   * Set the ship's speed
   */
  setSpeed(speed: number): void {
    // Clamp speed between 0 and max speed
    this.attributes.speed = Math.max(0, Math.min(speed, this.attributes.maxSpeed));
    this.updateVelocity();
    
    // Emit speed change event
    this.events.emit('speedChange', { speed: this.attributes.speed });
  }

  /**
   * Update the ship's position based on velocity
   */
  update(deltaTime: number): void {
    // Only move if not disabled
    if (!this.attributes.flags.isDisabled) {
      // Update position based on velocity
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;
      
      // Emit update event
      this.events.emit('update', { x: this.x, y: this.y, rotation: this.rotation, deltaTime });
    }
    
    // Check for sinking
    if (this.attributes.flags.isSinking) {
      this.attributes.health -= deltaTime * 5; // Sink at a rate of 5 health per second
      
      if (this.attributes.health <= 0) {
        this.events.emit('sink');
        // The game engine should handle removing the entity
      }
    }
    
    // Check for fire damage
    if (this.attributes.flags.isOnFire) {
      this.attributes.health -= deltaTime * 3; // Take 3 damage per second from fire
      this.attributes.crew -= deltaTime * 1; // Lose 1 crew member per second from fire
      
      // Emit fire damage event
      this.events.emit('fireDamage', { damage: deltaTime * 3, crewLost: deltaTime * 1 });
    }
  }

  /**
   * Apply damage to the ship
   */
  applyDamage(amount: number): void {
    this.attributes.health -= amount;
    
    // Check if ship is sinking
    if (this.attributes.health <= 0) {
      this.attributes.flags.isSinking = true;
      this.events.emit('startSinking');
    }
    
    // Emit damage event
    this.events.emit('damage', { amount, currentHealth: this.attributes.health });
  }

  /**
   * Repair the ship
   */
  repair(amount: number): void {
    // Can't repair if sinking
    if (this.attributes.flags.isSinking) return;
    
    this.attributes.health = Math.min(this.attributes.health + amount, this.attributes.maxHealth);
    
    // Emit repair event
    this.events.emit('repair', { amount, currentHealth: this.attributes.health });
  }

  /**
   * Fire cannons
   */
  fireCannons(side: 'port' | 'starboard' | 'bow' | 'stern'): boolean {
    // Check if ship has crew to operate cannons
    if (this.attributes.crew < this.attributes.cannonCount * 0.25) {
      this.events.emit('cannonsFailed', { reason: 'Not enough crew' });
      return false;
    }
    
    // Emit cannon fire event
    this.events.emit('cannonFire', { side });
    return true;
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.events.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.events.off(event, listener);
  }

  /**
   * Create a debug visualization using PIXI
   */
  createDebugGraphics(): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    
    // Draw ship triangle
    graphics.beginFill(this.isPlayer ? 0x00ff00 : 0xff0000);
    graphics.drawPolygon([
      0, -10,  // top point
      -5, 10,  // bottom left
      5, 10    // bottom right
    ]);
    graphics.endFill();
    
    // Draw direction indicator
    graphics.lineStyle(1, 0xffffff);
    graphics.moveTo(0, -10);
    graphics.lineTo(0, -15);
    
    // Draw health bar
    const healthPercent = this.attributes.health / this.attributes.maxHealth;
    graphics.lineStyle(0);
    
    // Health bar background
    graphics.beginFill(0x333333);
    graphics.drawRect(-10, -25, 20, 3);
    graphics.endFill();
    
    // Health bar fill
    const barColor = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffff00 : 0xff0000;
    graphics.beginFill(barColor);
    graphics.drawRect(-10, -25, 20 * healthPercent, 3);
    graphics.endFill();
    
    // Position and rotate the graphics
    graphics.x = this.x;
    graphics.y = this.y;
    graphics.rotation = this.rotation * Math.PI / 180;
    
    return graphics;
  }

  /**
   * Convert ship to a serializable object
   */
  toJSON(): object {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      vx: this.vx,
      vy: this.vy,
      isPlayer: this.isPlayer,
      attributes: { ...this.attributes },
      visibilityRange: this.visibilityRange
    };
  }

  /**
   * Create a ship from a serialized object
   */
  static fromJSON(data: any): ShipEntity {
    const ship = new ShipEntity(
      data.x,
      data.y,
      data.rotation,
      data.isPlayer,
      data.attributes.type,
      data.id
    );
    
    ship.vx = data.vx;
    ship.vy = data.vy;
    ship.attributes = { ...data.attributes };
    ship.visibilityRange = data.visibilityRange;
    
    return ship;
  }
}

/**
 * Factory function to create a ship entity
 */
export function createShipEntity(
  type: string = 'sloop',
  isPlayer: boolean = false,
  x: number = 0,
  y: number = 0,
  rotation: number = 0
): ShipEntity {
  return new ShipEntity(x, y, rotation, isPlayer, type);
}

/**
 * Create a predefined ship preset
 */
export function createShipPreset(
  presetName: 'playerSloop' | 'enemyFrigate' | 'alliedCutter' | 'bossManOfWar',
): ShipEntity {
  switch (presetName) {
    case 'playerSloop':
      const playerShip = createShipEntity('sloop', true);
      playerShip.visibilityRange = 600; // Better visibility for player
      return playerShip;
      
    case 'enemyFrigate':
      const enemyShip = createShipEntity('frigate', false);
      enemyShip.attributes.crew = 80; // Not full crew
      return enemyShip;
      
    case 'alliedCutter':
      const alliedShip = createShipEntity('cutter', false);
      // Set allied ship properties
      return alliedShip;
      
    case 'bossManOfWar':
      const bossShip = createShipEntity('man-of-war', false);
      // Make boss extra powerful
      bossShip.attributes.maxHealth *= 1.5;
      bossShip.attributes.health = bossShip.attributes.maxHealth;
      return bossShip;
      
    default:
      return createShipEntity('sloop', false);
  }
}
