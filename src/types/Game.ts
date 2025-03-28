// src/types/Game.ts
export interface GameState {
  isRunning: boolean;
  lastUpdate: number;
  deltaTime: number;
  entities: Entity[];
  eventQueue: GameEvent[];
  windDirection: number; // Direction in degrees (0-359)
  windSpeed: number; // Speed in knots
  weather: Weather;
  teams: Team[];
  turn: number; // For turn-based mode
  activeTeamId?: string; // Current active team in turn-based mode
  gameMode: 'realtime' | 'turnbased';
  timeScale: number; // For time acceleration
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Position;
  velocity: { x: number; y: number };
  rotation: number; // Ship heading in degrees (0-359)
  type: 'ship' | 'aircraft' | 'missile' | 'port' | 'terrain';
  status: 'idle' | 'moving' | 'combat' | 'boarding' | 'repairing' | 'sinking';
  targetPosition?: Position;
  teamId: string;
  name: string;
}

export interface ShipEntity extends Entity {
  type: 'ship';
  shipClass: ShipClass;
  currentHealth: number;
  maxHealth: number;
  currentCrew: number;
  maxCrew: number;
  currentSupplies: number;
  maxSupplies: number;
  sailConfiguration: SailConfiguration;
  cannons: Cannon[];
  damageState: DamageState;
  officerId?: string;
  currentSpeed: number; // Current speed in knots
  maxSpeed: number; // Maximum speed in ideal conditions
  maneuverability: number; // Turning rate (1-10)
  visibilityRange: number; // Detection range
  nationality: string;
  experienceLevel: number; // 1-5 representing crew training
}

export type ShipClass = 
  | 'FirstRate' // 100+ guns
  | 'SecondRate' // 90-98 guns
  | 'ThirdRate' // 64-80 guns
  | 'FourthRate' // 46-60 guns
  | 'FifthRate' // 32-44 guns
  | 'SixthRate' // 20-28 guns
  | 'Sloop' // 16-18 guns
  | 'Cutter' // 8-14 guns
  | 'Fireship';

export interface SailConfiguration {
  mainSails: number; // 0-100% deployed
  topSails: number; // 0-100% deployed
  jibs: number; // 0-100% deployed
  spanker: number; // 0-100% deployed
  currentConfig: 'full' | 'battle' | 'reduced' | 'minimal' | 'none';
}

export interface Cannon {
  type: 'long' | 'carronade' | 'mortar';
  caliber: number; // Pounder rating
  location: 'port' | 'starboard' | 'bow' | 'stern';
  range: number;
  reloadTime: number;
  currentReload: number;
  ammunition: AmmoType;
  status: 'ready' | 'reloading' | 'disabled';
}

export type AmmoType = 'roundshot' | 'chainshot' | 'grapeshot' | 'doubleshot' | 'hotshot';

export interface DamageState {
  hullIntegrity: number; // 0-100%
  rigDamage: number; // 0-100% 
  rudderDamage: number; // 0-100%
  masts: {
    fore: number;  // 0-100%
    main: number;  // 0-100%
    mizzen: number;  // 0-100%
  };
  onFire: boolean;
  floodingRate: number; // Water intake per minute
  crewCasualties: number;
}

export interface Officer {
  id: string;
  name: string;
  rank: string;
  specialties: ('gunnery' | 'navigation' | 'leadership' | 'boarding')[];
  abilities: Ability[];
  experiencePoints: number;
  level: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  effect: string;
}

export interface Team {
  id: string;
  name: string;
  nationality: string;
  color: string;
  resources: Resources;
  isPlayerControlled: boolean;
  aiPersonality?: string;
}

export interface Resources {
  gold: number;
  supplies: number;
  ammunition: number;
  repairMaterials: number;
}

export type Weather = 
  | 'clear' 
  | 'cloudy' 
  | 'rain' 
  | 'heavyRain'
  | 'storm'
  | 'fog';

export interface GameConfig {
  gridSize: number;
  tickRate: number; // updates per second
  initialWeather: Weather;
  initialWindDirection: number;
  initialWindSpeed: number;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  mapType: 'openSea' | 'coastal' | 'archipelago' | 'harbor';
  gameMode: 'realtime' | 'turnbased';
  victoryCondition: 'elimination' | 'objective' | 'pointLimit';
  turnTimeLimit?: number; // Time limit per turn in seconds (for turn-based)
}

export type GameEvent = 
  | MoveEvent 
  | CombatEvent 
  | WeatherEvent 
  | BoardingEvent
  | DamageEvent
  | RepairEvent
  | TurnEvent;

export interface MoveEvent {
  type: 'entityMove';
  entityId: string;
  targetPosition?: Position;
  course?: number;
  speed?: number;
}

export interface CombatEvent {
  type: 'combatStart' | 'combatEnd' | 'cannonFire';
  entityId: string;
  targetId?: string;
  weaponType?: string;
  ammunition?: AmmoType;
  side?: 'port' | 'starboard' | 'bow' | 'stern';
}

export interface WeatherEvent {
  type: 'weatherChange' | 'windChange';
  newWeather?: Weather;
  newWindDirection?: number;
  newWindSpeed?: number;
}

export interface BoardingEvent {
  type: 'boardingStart' | 'boardingEnd' | 'boardingResult';
  attackerId: string;
  defenderId: string;
  result?: 'success' | 'failure';
}

export interface DamageEvent {
  type: 'shipDamage';
  entityId: string;
  damageType: 'hull' | 'rigging' | 'mast' | 'rudder' | 'crew';
  amount: number;
  isCritical: boolean;
}

export interface RepairEvent {
  type: 'repair';
  entityId: string;
  repairType: 'hull' | 'rigging' | 'mast' | 'rudder' | 'fire';
  amount: number;
}

export interface TurnEvent {
  type: 'turnStart' | 'turnEnd';
  teamId: string;
  turnNumber: number;
}