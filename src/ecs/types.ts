
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
  execute: (deltaTime: number, entities: Entity[]) => void;
  executeBeforeUpdate?: () => void;
  executeAfterUpdate?: () => void;
}

export interface PositionComponent {
  type: string;
  entityId: EntityId;
  x: number;
  y: number;
  z?: number;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
  enabled: boolean;
}

export interface VelocityComponent {
  type: string;
  entityId: EntityId;
  vx: number;
  vy: number;
  vz?: number;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
  enabled: boolean;
}

export interface RotationComponent {
  type: string;
  entityId: EntityId;
  angle: number;
  x?: number;
  y?: number;
  z?: number;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
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

// Additional component interfaces required by other files
export interface ScaleComponent {
  type: string;
  entityId: EntityId;
  x: number;
  y: number;
  z?: number;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
  enabled: boolean;
}

export interface RenderableComponent {
  type: string;
  entityId: EntityId;
  mesh?: string;
  texture?: string;
  color?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  renderLayer?: string;
  customRenderData?: any;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
  enabled: boolean;
}

export interface ColliderComponent {
  type: string;
  entityId: EntityId;
  shape: 'circle' | 'rectangle' | 'polygon';
  radius?: number;
  width?: number;
  height?: number;
  points?: Position[];
  isTrigger: boolean;
  collisionLayer: number;
  collisionMask: number;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
  enabled: boolean;
}

export interface HealthComponent {
  type: string;
  entityId: EntityId;
  current: number;
  max: number;
  regeneration: number;
  invincible: boolean;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
  enabled: boolean;
}

// Base Component interface
export interface Component {
  type: string;
  entityId: EntityId;
  priority?: SystemPriority;
  lodLevel?: LODLevel;
  enabled: boolean;
  [key: string]: any;
}

// Entity type
export interface Entity {
  id: EntityId;
  components: Map<string, Component>;
  active: boolean;
  tags: Set<string>;
}

// Query for filtering entities
export interface EntityQuery {
  active?: boolean;
  withComponents?: string[];
  withoutComponents?: string[];
  withTags?: string[];
  withoutTags?: string[];
}

// System Performance Metrics
export interface SystemPerformanceMetrics {
  systemName: string;
  executionTime: number;
  entitiesProcessed: number;
  lastExecutionTimestamp: number;
  averageExecutionTime: number;
}

// EntityEventCallback type
export type EntityEventCallback = (data: any) => void;

// Type alias for component type strings
export type ComponentType = string;

// Priority levels for systems
export type SystemPriority = 'high' | 'medium' | 'low';

// Level of Detail levels
export type LODLevel = 'high' | 'medium' | 'low';
