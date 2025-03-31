
export type ShipClass = 'FirstRate' | 'SecondRate' | 'ThirdRate' | 'FourthRate' | 'FifthRate' | 'SixthRate' | 'Sloop' | 'Cutter' | 'Fireship';
export type Weather = 'clear' | 'cloudy' | 'rain' | 'fog';
export type AmmoType = 'roundShot' | 'chainShot' | 'grapeShot' | 'doubleShot';

export interface Position {
  x: number;
  y: number;
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

export interface ShipEntity {
  id: string;
  type: string;
  teamId: string;
  position: Position;
  rotation: number;
  currentSpeed: number;
  maxSpeed: number;
  status: 'idle' | 'moving' | 'combat' | 'boarding' | 'boarded' | 'sinking' | 'repairing';
  shipClass: ShipClass;
  name: string;
  nationality: string;
  damageState: {
    hullIntegrity: number;
    mastDamage: number;
    riggingDamage: number;
    crewInjuries: number;
    rudderDamage: number;
    onFire: boolean;
    floodingRate: number;
    masts: {
      fore: number;
      main: number;
      mizzen: number;
    };
    crewCasualties: number;
  };
  currentCrew: number;
  maxCrew: number;
  currentSupplies: number;
  maxSupplies: number;
  experienceLevel: number;
  visibilityRange: number;
  sailConfiguration: {
    currentConfig: 'full' | 'battle' | 'reduced' | 'minimal' | 'none';
    mainSails: number;
    topSails: number;
    jibs: number;
    spanker: number;
  };
  cannons?: Array<{
    location: 'port' | 'starboard' | 'bow' | 'stern';
    status: 'ready' | 'reloading' | 'disabled';
  }>;
}

export interface GameConfig {
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

export interface GameState {
  turn: number;
  teams: Team[];
  entities: any[];
  weather: Weather;
  windDirection: number;
  windSpeed: number;
}

export interface ShipAttributes {
  health: number;
  maxHealth: number;
  speed: number;
  maxSpeed: number;
  turnRate: number;
  crewCount: number;
  maxCrewCount: number;
  firepower: {
    port: number;
    starboard: number;
    bow: number;
    stern: number;
  };
}

export interface EntityEvent {
  type: string;
  sourceEntityId: string;
  targetEntityId?: string;
  data?: any;
}

