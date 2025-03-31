
export type ShipClass = 'FirstRate' | 'SecondRate' | 'ThirdRate' | 'FourthRate' | 'FifthRate' | 'SixthRate' | 'Sloop' | 'Cutter';
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
  status: 'idle' | 'moving' | 'combat' | 'boarding' | 'boarded' | 'sinking';
  shipClass: ShipClass;
  name: string;
  damageState: {
    hullIntegrity: number;
    mastDamage: number;
    riggingDamage: number;
    crewInjuries: number;
    rudderDamage: number;
  };
  visibilityRange: number;
  sailConfiguration?: 'full' | 'battle' | 'reduced' | 'minimal' | 'none';
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
