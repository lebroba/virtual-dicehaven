// Fix the import path
import { EventSystem } from "../ecs/EventSystem";
import { 
  GameState, 
  ShipClass, 
  Position, 
  Team, 
  Weather, 
  GameConfig, 
  ShipEntity as ShipEntityType,
  EntityEvent
} from "../types/Game";

export class GameEngine {
  private gameState: GameState;
  private ships: any[];
  private weather: any;
  private eventBus: EventSystem;
  private subscribers: ((state: GameState) => void)[] = [];
  private isRunning: boolean = false;
  private config: GameConfig;

  constructor(config?: Partial<GameConfig>) {
    // Default configuration
    const defaultConfig: GameConfig = {
      gridSize: 100,
      tickRate: 60,
      initialWeather: 'clear',
      initialWindDirection: 0,
      initialWindSpeed: 10,
      timeOfDay: 'day',
      mapType: 'openSea',
      gameMode: 'realtime',
      victoryCondition: 'elimination'
    };
    
    this.config = { ...defaultConfig, ...config };
    
    this.gameState = {
      turn: 0,
      teams: [],
      entities: [],
      weather: this.config.initialWeather,
      windDirection: this.config.initialWindDirection,
      windSpeed: this.config.initialWindSpeed
    };
    
    this.ships = [];
    this.weather = {
      windDirection: this.config.initialWindDirection,
      windSpeed: this.config.initialWindSpeed
    };
    this.eventBus = new EventSystem();
  }

  // Get current game state
  getState(): GameState {
    return { ...this.gameState };
  }

  // Start the game engine
  start(): void {
    this.isRunning = true;
    this.notifySubscribers();
  }

  // Stop the game engine
  stop(): void {
    this.isRunning = false;
  }

  // Subscribe to state updates
  subscribe(callback: (state: GameState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  // Notify all subscribers of state changes
  private notifySubscribers(): void {
    const state = this.getState();
    for (const subscriber of this.subscribers) {
      subscriber(state);
    }
  }

  // Create ship from preset
  createShipPreset(
    shipClass: ShipClass,
    position: Position,
    teamId: string,
    nationality: string
  ): string {
    // Generate a unique ID for the ship
    const shipId = `ship_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a new ship entity
    const ship: ShipEntityType = {
      id: shipId,
      type: 'ship',
      teamId: teamId,
      shipClass: shipClass,
      position: { ...position },
      rotation: 0,
      currentSpeed: 0,
      maxSpeed: 10,
      status: 'idle',
      name: this.generateShipName(nationality, shipClass),
      nationality: nationality,
      damageState: {
        hullIntegrity: 100,
        mastDamage: 0,
        riggingDamage: 0,
        crewInjuries: 0,
        rudderDamage: 0,
        onFire: false,
        floodingRate: 0,
        masts: {
          fore: 100,
          main: 100,
          mizzen: 100
        },
        crewCasualties: 0
      },
      visibilityRange: 500,
      currentCrew: 100,
      maxCrew: 100,
      currentSupplies: 100,
      maxSupplies: 100,
      experienceLevel: 3,
      sailConfiguration: {
        currentConfig: 'full',
        mainSails: 100,
        topSails: 100,
        jibs: 100,
        spanker: 100
      },
      cannons: [
        { location: 'port', status: 'ready' },
        { location: 'starboard', status: 'ready' },
        { location: 'bow', status: 'ready' },
        { location: 'stern', status: 'ready' }
      ]
    };
    
    // Add to game state entities
    this.gameState.entities.push(ship);
    
    // Notify subscribers of state change
    this.notifySubscribers();
    
    return shipId;
  }

  // Generate a ship name based on nationality and class
  private generateShipName(nationality: string, shipClass: ShipClass): string {
    const namePrefixes: Record<string, string[]> = {
      'british': ['HMS', 'HMS'],
      'french': ['Le', 'La'],
      'spanish': ['El', 'La'],
      'american': ['USS', 'USS'],
      'dutch': ['HNLMS', 'HNLMS']
    };
    
    const namesByNationality: Record<string, string[]> = {
      'british': ['Victory', 'Sovereign', 'Bellerophon', 'Temeraire', 'Dreadnought', 'Agamemnon', 'Ajax', 'Leviathan'],
      'french': ['Bucentaure', 'Formidable', 'Neptune', 'Redoutable', 'Scipion', 'Mont-Blanc', 'Argonaute'],
      'spanish': ['Santisima Trinidad', 'Santa Ana', 'San Justo', 'San Leandro', 'Neptuno', 'Rayo', 'Monarca'],
      'american': ['Constitution', 'United States', 'Constellation', 'Congress', 'President', 'Chesapeake'],
      'dutch': ['Delft', 'Utrecht', 'Rotterdam', 'Amsterdam', 'Gelderland', 'Overijssel', 'Friesland']
    };
    
    const prefixes = namePrefixes[nationality] || [''];
    const names = namesByNationality[nationality] || ['Unknown'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    
    return `${prefix} ${name}`;
  }

  // Set course and speed of a ship
  setCourseAndSpeed(shipId: string, course: number, speed: number): void {
    const shipIndex = this.gameState.entities.findIndex(e => e.id === shipId && e.type === 'ship');
    if (shipIndex !== -1) {
      const ship = this.gameState.entities[shipIndex] as ShipEntityType;
      ship.rotation = course;
      ship.currentSpeed = speed;
      ship.status = speed > 0 ? 'moving' : 'idle';
      
      this.notifySubscribers();
    }
  }

  // Set sail configuration
  setSailConfiguration(
    shipId: string,
    config: 'full' | 'battle' | 'reduced' | 'minimal' | 'none'
  ): void {
    const shipIndex = this.gameState.entities.findIndex(e => e.id === shipId && e.type === 'ship');
    if (shipIndex !== -1) {
      const ship = this.gameState.entities[shipIndex] as ShipEntityType;
      if (ship.sailConfiguration) {
        ship.sailConfiguration.currentConfig = config;
      } else {
        ship.sailConfiguration = {
          currentConfig: config,
          mainSails: 100,
          topSails: 100,
          jibs: 100,
          spanker: 100
        };
      }
      
      // Adjust speed based on sail configuration
      const maxSpeedMultipliers = {
        'full': 1.0,
        'battle': 0.75,
        'reduced': 0.5,
        'minimal': 0.25,
        'none': 0
      };
      
      if (ship.currentSpeed > 0) {
        ship.currentSpeed = ship.maxSpeed * maxSpeedMultipliers[config];
      }
      
      this.notifySubscribers();
    }
  }

  // Fire cannons from a ship
  fireCannons(
    shipId: string,
    side: "port" | "starboard" | "bow" | "stern",
    targetId?: string
  ): void {
    const shipIndex = this.gameState.entities.findIndex(e => e.id === shipId && e.type === 'ship');
    if (shipIndex !== -1) {
      const ship = this.gameState.entities[shipIndex];
      ship.status = 'combat';
      
      // Create a combat event
      this.eventBus.dispatchEvent({
        type: "cannonFire",
        sourceEntityId: shipId,
        targetEntityId: targetId || "",
        data: { side, ammunition: 10 }
      } as EntityEvent);
      
      this.notifySubscribers();
    }
  }

  // Initiate boarding action
  initiateBoarding(attackerId: string, defenderId: string): void {
    const attackerIndex = this.gameState.entities.findIndex(e => e.id === attackerId && e.type === 'ship');
    const defenderIndex = this.gameState.entities.findIndex(e => e.id === defenderId && e.type === 'ship');
    
    if (attackerIndex !== -1 && defenderIndex !== -1) {
      const attacker = this.gameState.entities[attackerIndex];
      const defender = this.gameState.entities[defenderIndex];
      
      attacker.status = 'boarding';
      defender.status = 'boarded';
      
      this.eventBus.dispatchEvent({
        type: "boarding",
        sourceEntityId: attackerId,
        targetEntityId: defenderId,
        data: { result: "pending" }
      } as EntityEvent);
      
      this.notifySubscribers();
    }
  }

  // Repair ship damage
  repairShip(
    shipId: string,
    repairType: 'hull' | 'rigging' | 'mast' | 'rudder' | 'fire'
  ): void {
    const shipIndex = this.gameState.entities.findIndex(e => e.id === shipId && e.type === 'ship');
    if (shipIndex !== -1) {
      const ship = this.gameState.entities[shipIndex] as ShipEntityType;
      ship.status = 'repairing';
      
      switch(repairType) {
        case 'hull':
          ship.damageState.hullIntegrity = Math.min(ship.damageState.hullIntegrity + 10, 100);
          break;
        case 'rigging':
          ship.damageState.riggingDamage = Math.max(ship.damageState.riggingDamage - 10, 0);
          break;
        case 'mast':
          ship.damageState.mastDamage = Math.max(ship.damageState.mastDamage - 10, 0);
          break;
        case 'rudder':
          ship.damageState.rudderDamage = Math.max(ship.damageState.rudderDamage - 10, 0);
          break;
        case 'fire':
          ship.damageState.onFire = false;
          break;
      }
      
      this.eventBus.dispatchEvent({
        type: "repair",
        sourceEntityId: shipId,
        data: { repairType, amount: 10 }
      } as EntityEvent);
      
      this.notifySubscribers();
    }
  }

  // Set current weather
  setWeather(weather: Weather): void {
    this.gameState.weather = weather;
    this.notifySubscribers();
  }

  // Set wind direction
  setWindDirection(direction: number): void {
    this.gameState.windDirection = direction;
    this.weather.windDirection = direction;

    this.eventBus.dispatchEvent({
      type: "windChange",
      sourceEntityId: "weather-system",
      data: { 
        previousDirection: this.weather.windDirection,
        newDirection: direction 
      }
    } as EntityEvent);
    
    this.notifySubscribers();
  }

  // Set wind speed
  setWindSpeed(speed: number): void {
    this.gameState.windSpeed = speed;
    this.weather.windSpeed = speed;

    this.eventBus.dispatchEvent({
      type: "windChange",
      sourceEntityId: "weather-system",
      data: { 
        previousSpeed: this.weather.windSpeed,
        newSpeed: speed 
      }
    } as EntityEvent);
    
    this.notifySubscribers();
  }

  // Update wind direction and speed
  updateWindDirection(direction: number): void {
    this.setWindDirection(direction);
  }

  updateWindSpeed(speed: number): void {
    this.setWindSpeed(speed);
  }

  damageShip(entityId: string, damageType: "hull" | "mast" | "rigging" | "crew" | "rudder", amount: number, isCritical: boolean): void {
    const shipIndex = this.gameState.entities.findIndex(e => e.id === entityId && e.type === 'ship');
    if (shipIndex !== -1) {
      const ship = this.gameState.entities[shipIndex] as ShipEntityType;
      
      switch(damageType) {
        case 'hull':
          ship.damageState.hullIntegrity -= amount;
          if (ship.damageState.hullIntegrity <= 0) {
            ship.status = 'sinking';
          }
          break;
        case 'mast':
          ship.damageState.mastDamage += amount;
          break;
        case 'rigging':
          ship.damageState.riggingDamage += amount;
          break;
        case 'crew':
          ship.damageState.crewInjuries += amount;
          break;
        case 'rudder':
          ship.damageState.rudderDamage += amount;
          break;
      }
      
      this.eventBus.dispatchEvent({
        type: "shipDamage",
        sourceEntityId: "combat-system",
        targetEntityId: entityId,
        data: { damageType, amount, isCritical }
      } as EntityEvent);
      
      this.notifySubscribers();
    }
  }

  getShipPosition(entityId: string): { x: number, y: number } {
    const shipData = this.ships.find(ship => ship.id === entityId);
    const x = shipData?.position?.x as number || 0;
    const y = shipData?.position?.y as number || 0;
    return { x, y };
  }

  getShipByName(name: string): any {
    const ship = this.ships.find(s => s.name === name);
    return ship || null;
  }
}

export type { GameState, GameConfig, ShipClass, Position, Team, Weather };
