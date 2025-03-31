
// Fix the import path
import { EventSystem } from "../ecs/EventSystem";

// Define the types needed for the GameEngine
interface GameState {
  turn: number;
  teams: Team[];
  entities: any[];
  weather: Weather;
  windDirection: number;
  windSpeed: number;
}

interface Team {
  id: string;
  name: string;
  nationality: string;
  color: string;
  isPlayerControlled: boolean;
  aiPersonality?: string;
  resources: {
    gold: number;
    supplies: number;
    ammunition: number;
    repairMaterials: number;
  };
}

type Weather = 'clear' | 'cloudy' | 'rain' | 'fog';

interface ShipEntity {
  visibilityRange: number;
  id: string;
  type: string;
  teamId: string;
  position: { x: number, y: number };
  rotation: number;
  status: string;
  shipClass: string;
  currentSpeed: number;
  damageState: { hullIntegrity: number };
  name: string;
}

interface GameConfig {
  gridSize: number;
  tickRate: number;
  initialWeather: Weather;
  initialWindDirection: number;
  initialWindSpeed: number;
  timeOfDay: string;
  mapType: string;
  gameMode: string;
  victoryCondition: string;
}

interface WeatherEvent {
  type: string;
  previousWeather: any;
  newWeather: any;
  time: number;
  data: {
    newWindDirection?: number;
    newWindSpeed?: number;
  };
}

interface CombatEvent {
  type: string;
  attacker: string;
  defender: string;
  time: number;
  data: {
    side: "port" | "starboard" | "bow" | "stern";
    ammunition: number;
  };
}

interface DamageEvent {
  type: string;
  shipId: string;
  location: "hull" | "mast" | "rigging" | "crew" | "rudder";
  time: number;
  data: {
    amount: number;
    isCritical: boolean;
  };
}

interface Position {
  x: number;
  y: number;
}

type ShipClass = 'FirstRate' | 'SecondRate' | 'ThirdRate' | 'FourthRate' | 'FifthRate' | 'SixthRate' | 'Sloop' | 'Cutter';

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
    const ship = {
      id: shipId,
      type: 'ship',
      teamId: teamId,
      shipClass: shipClass,
      position: { ...position },
      rotation: 0,
      currentSpeed: 0,
      status: 'idle',
      name: this.generateShipName(nationality, shipClass),
      damageState: {
        hullIntegrity: 100,
        mastDamage: 0,
        riggingDamage: 0,
        crewInjuries: 0,
        rudderDamage: 0
      },
      visibilityRange: 500
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
      const ship = this.gameState.entities[shipIndex];
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
      const ship = this.gameState.entities[shipIndex];
      ship.sailConfiguration = config;
      
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
        attacker: shipId,
        defender: targetId || "",
        time: Date.now(),
        data: { side, ammunition: 10 }
      } as CombatEvent);
      
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
        time: Date.now(),
        data: { attackerId, defenderId, result: "pending" }
      });
      
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
      const ship = this.gameState.entities[shipIndex];
      
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
          ship.onFire = false;
          break;
      }
      
      this.eventBus.dispatchEvent({
        type: "repair",
        time: Date.now(),
        data: { entityId: shipId, repairType, amount: 10 }
      });
      
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
      previousWeather: this.weather,
      newWeather: this.weather,
      time: Date.now(),
      data: { newWindDirection: direction }
    } as WeatherEvent);
    
    this.notifySubscribers();
  }

  // Set wind speed
  setWindSpeed(speed: number): void {
    this.gameState.windSpeed = speed;
    this.weather.windSpeed = speed;

    this.eventBus.dispatchEvent({
      type: "windChange",
      previousWeather: this.weather,
      newWeather: this.weather,
      time: Date.now(),
      data: { newWindSpeed: speed }
    } as WeatherEvent);
    
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
      const ship = this.gameState.entities[shipIndex];
      
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
        shipId: entityId,
        location: damageType,
        time: Date.now(),
        data: { amount, isCritical }
      } as DamageEvent);
      
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
