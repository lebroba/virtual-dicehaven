
export type EntityId = number | string;

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface EntityEvent {
  type: string;
  sourceEntityId: EntityId;
  targetEntityId?: EntityId;
  data?: any;
  time?: number;
}

export interface System {
  name: string;
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  dependencies?: string[];
  execute: (deltaTime: number, entities: any[]) => void;
}

export interface PositionComponent {
  entityId: EntityId;
  x: number;
  y: number;
  z?: number;
  enabled: boolean;
}

export interface VelocityComponent {
  entityId: EntityId;
  vx: number;
  vy: number;
  vz?: number;
  enabled: boolean;
}

export interface RotationComponent {
  entityId: EntityId;
  angle: number;
  enabled: boolean;
}

export interface ShipComponent {
  type: 'ship';
  entityId: EntityId;
  shipClass: 'FirstRate' | 'SecondRate' | 'ThirdRate' | 'FourthRate' | 'FifthRate' | 'SixthRate' | 'Sloop' | 'Cutter' | 'Fireship';
  hull: {
    current: number;
    max: number;
  };
  crew: {
    current: number;
    max: number;
  };
  supplies: {
    current: number;
    max: number;
  };
  cannons: {
    port: number;
    starboard: number;
    bow: number;
    stern: number;
  };
  sails: {
    mainSails: number;
    topSails: number;
    jibs: number;
    spanker: number;
    configuration: 'full' | 'battle' | 'reduced' | 'minimal' | 'none';
  };
  damage: {
    hull: number;
    rigging: number;
    rudder: number;
    masts: {
      fore: number;
      main: number;
      mizzen: number;
    };
    onFire: boolean;
    floodingRate: number;
  };
  speed: {
    current: number;
    max: number;
  };
  nationality: string;
  experienceLevel: number;
  isAI: boolean;
  priority: 'high' | 'medium' | 'low';
  lodLevel: 'high' | 'medium' | 'low';
  enabled: boolean;
}
