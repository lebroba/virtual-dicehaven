
// Basic types for the naval warfare game

export type ShipClass = 
  'FirstRate' | 'SecondRate' | 'ThirdRate' | 'FourthRate' | 
  'FifthRate' | 'SixthRate' | 'Sloop' | 'Cutter' | 'Fireship';

export type ShipStatus = 'idle' | 'moving' | 'combat' | 'boarding' | 'sinking' | 'repairing';

export type AmmoType = 'roundshot' | 'chainshot' | 'grapeshot' | 'doubleshot' | 'hotshot';

export type Weather = 'clear' | 'rain' | 'storm' | 'fog' | 'heavyFog' | 'cloudy' | 'heavyRain';

export type CannonStatus = 'ready' | 'reloading' | 'disabled';

export interface ShipCannon {
  location: 'port' | 'starboard' | 'bow' | 'stern';
  status: CannonStatus;
  reloadProgress: number;
  ammoType: AmmoType;
  reloadTime?: number;
  ammunition?: number;
  currentReload?: number;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface ShipEntity {
  id: string;
  name: string;
  shipClass: ShipClass;
  nationality: string;
  teamId: string;
  position: Position;
  rotation: number; // 0-359 degrees
  currentSpeed: number;
  maxSpeed: number;
  status: ShipStatus;
  damageState: {
    hullIntegrity: number; // 0-100
    rigDamage: number; // 0-100
    rudderDamage: number; // 0-100
    masts: {
      fore: number; // 0-100
      main: number; // 0-100
      mizzen: number; // 0-100
    };
    onFire: boolean;
    floodingRate: number;
    crewCasualties: number;
  };
  sailConfiguration: {
    currentConfig: 'full' | 'battle' | 'reduced' | 'minimal' | 'none';
    mainSails: number; // 0-100
    topSails: number; // 0-100
    jibs: number; // 0-100
    spanker: number; // 0-100
  };
  cannons: ShipCannon[];
  currentCrew: number;
  maxCrew: number;
  currentSupplies: number;
  maxSupplies: number;
  experienceLevel: number; // 1-5
  type: 'ship';
  // Additional properties needed by the engine
  velocity?: {
    x: number;
    y: number;
  };
  targetPosition?: Position;
  currentHealth?: number;
  maxHealth?: number;
}

export interface Team {
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

export interface GameConfig {
  gridSize: number;
  tickRate: number;
  initialWeather: Weather;
  initialWindDirection: number; // 0-359 degrees
  initialWindSpeed: number; // knots
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  mapType: 'openSea' | 'coastal' | 'archipelago' | 'harbor';
  gameMode: 'realtime' | 'turnBased';
  victoryCondition: 'elimination' | 'captureFlag' | 'escort' | 'survival';
}

// Game State
export interface GameState {
  ships: ShipEntity[];
  teams: Team[];
  weather: Weather;
  windDirection: number; // 0-359 degrees
  windSpeed: number; // knots
  time: number; // elapsed time in seconds
  gameMode: 'realtime' | 'turnBased';
  currentTurn?: number;
  currentTeamId?: string;
  status: 'preparing' | 'running' | 'paused' | 'completed';
  winner?: string; // team ID of winner
}

// Event types
export interface GameEvent {
  type: string;
  time: number;
  source?: string;
  target?: string;
  data: any;
}

export interface CombatEvent extends GameEvent {
  type: 'attack' | 'hit' | 'miss' | 'critical' | 'boarding';
  attacker: string; // ship ID
  defender: string; // ship ID
  damage?: number;
  location?: 'hull' | 'mast' | 'rigging' | 'crew' | 'rudder';
  ammunition?: AmmoType;
}

export interface DamageEvent extends GameEvent {
  type: 'damage';
  shipId: string;
  damageType: 'fire' | 'flooding' | 'collision' | 'weather' | 'cannon' | 'boarding';
  amount: number;
  location: 'hull' | 'mast' | 'rigging' | 'crew' | 'rudder';
}

export interface WeatherEvent extends GameEvent {
  type: 'weatherChange';
  previousWeather: Weather;
  newWeather: Weather;
  windDirectionChange?: number;
  windSpeedChange?: number;
}

// Entities in the game
export interface Entity {
  id: string;
  type: 'ship' | 'land' | 'fort' | 'obstacle' | 'item' | 'effect';
  position: Position;
  [key: string]: any; // Allow additional properties
}
