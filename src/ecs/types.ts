
export type EntityId = number;
export type ComponentType = string;
export type SystemPriority = 'high' | 'medium' | 'low';
export type LODLevel = 'high' | 'medium' | 'low';

export interface Component {
  type: ComponentType;
  entityId: EntityId;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
  enabled?: boolean;
}

export interface System {
  name: string;
  priority: SystemPriority;
  enabled: boolean;
  executeBeforeUpdate?: () => void;
  execute: (deltaTime: number, entities: Entity[]) => void;
  executeAfterUpdate?: () => void;
  dependencies?: string[]; // System names this system depends on
}

export interface Entity {
  id: EntityId;
  components: Map<ComponentType, Component>;
  active: boolean;
  tags: Set<string>;
}

export type EntityQuery = {
  withComponents?: ComponentType[];
  withoutComponents?: ComponentType[];
  withTags?: string[];
  withoutTags?: string[];
  active?: boolean;
};

export type EntityEventCallback = (data: any) => void;

export interface EntityEvent {
  type: string;
  sourceEntityId: EntityId;
  targetEntityId?: EntityId;
  data: any;
}

// Performance metrics for systems
export interface SystemPerformanceMetrics {
  systemName: string;
  executionTime: number; // in milliseconds
  entitiesProcessed: number;
  lastExecutionTimestamp: number;
  averageExecutionTime: number;
}

// Define the specific component interfaces
export interface PositionComponent extends Component {
  type: 'position';
  x: number;
  y: number;
  z?: number;
}

export interface VelocityComponent extends Component {
  type: 'velocity';
  vx: number;
  vy: number;
  vz?: number;
}

export interface RotationComponent extends Component {
  type: 'rotation';
  angle: number;  // in degrees
  x?: number;     // for 3D rotation
  y?: number;     // for 3D rotation
  z?: number;     // for 3D rotation
}

export interface ScaleComponent extends Component {
  type: 'scale';
  x: number;
  y: number;
  z?: number;
}

export interface RenderableComponent extends Component {
  type: 'renderable';
  mesh?: string;
  texture?: string;
  color?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  renderLayer?: string;
  customRenderData?: any;
}

export interface ColliderComponent extends Component {
  type: 'collider';
  shape: 'circle' | 'rectangle' | 'polygon';
  radius?: number;  // for circle
  width?: number;   // for rectangle
  height?: number;  // for rectangle
  points?: {x: number, y: number}[];  // for polygon
  isTrigger: boolean;
  collisionLayer: number;
  collisionMask: number;
}

export interface HealthComponent extends Component {
  type: 'health';
  max: number;
  current: number;
  regeneration: number;
  invincible: boolean;
}

export interface ShipComponent extends Component {
  type: 'ship';
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
    mainSails: number; // 0-100%
    topSails: number; // 0-100%
    jibs: number; // 0-100%
    spanker: number; // 0-100%
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
  experienceLevel: number; // 1-5
  isAI: boolean;
}
