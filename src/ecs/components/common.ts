
import { EntityId, PositionComponent, VelocityComponent, RotationComponent, ScaleComponent, RenderableComponent, ColliderComponent, HealthComponent } from '../types';

/**
 * Create a position component
 */
export function createPositionComponent(
  entityId: EntityId,
  x: number = 0,
  y: number = 0,
  z?: number,
  options: {
    priority?: 'high' | 'medium' | 'low',
    lodLevel?: 'high' | 'medium' | 'low',
    enabled?: boolean
  } = {}
): PositionComponent {
  return {
    type: 'position',
    entityId,
    x,
    y,
    z,
    priority: options.priority || 'high',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Create a velocity component
 */
export function createVelocityComponent(
  entityId: EntityId,
  vx: number = 0,
  vy: number = 0,
  vz?: number,
  options: {
    priority?: 'high' | 'medium' | 'low',
    lodLevel?: 'high' | 'medium' | 'low',
    enabled?: boolean
  } = {}
): VelocityComponent {
  return {
    type: 'velocity',
    entityId,
    vx,
    vy,
    vz,
    priority: options.priority || 'medium',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Create a rotation component
 */
export function createRotationComponent(
  entityId: EntityId,
  angle: number = 0,
  options: {
    x?: number,
    y?: number,
    z?: number,
    priority?: 'high' | 'medium' | 'low',
    lodLevel?: 'high' | 'medium' | 'low',
    enabled?: boolean
  } = {}
): RotationComponent {
  return {
    type: 'rotation',
    entityId,
    angle,
    x: options.x,
    y: options.y,
    z: options.z,
    priority: options.priority || 'medium',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Create a scale component
 */
export function createScaleComponent(
  entityId: EntityId,
  x: number = 1,
  y: number = 1,
  z?: number,
  options: {
    priority?: 'high' | 'medium' | 'low',
    lodLevel?: 'high' | 'medium' | 'low',
    enabled?: boolean
  } = {}
): ScaleComponent {
  return {
    type: 'scale',
    entityId,
    x,
    y,
    z,
    priority: options.priority || 'medium',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Create a renderable component
 */
export function createRenderableComponent(
  entityId: EntityId,
  options: {
    mesh?: string,
    texture?: string,
    color?: string,
    visible?: boolean,
    opacity?: number,
    zIndex?: number,
    renderLayer?: string,
    customRenderData?: any,
    priority?: 'high' | 'medium' | 'low',
    lodLevel?: 'high' | 'medium' | 'low',
    enabled?: boolean
  } = {}
): RenderableComponent {
  return {
    type: 'renderable',
    entityId,
    mesh: options.mesh,
    texture: options.texture,
    color: options.color,
    visible: options.visible !== undefined ? options.visible : true,
    opacity: options.opacity !== undefined ? options.opacity : 1,
    zIndex: options.zIndex || 0,
    renderLayer: options.renderLayer,
    customRenderData: options.customRenderData,
    priority: options.priority || 'medium',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Create a collider component
 */
export function createColliderComponent(
  entityId: EntityId,
  shape: 'circle' | 'rectangle' | 'polygon',
  options: {
    radius?: number,
    width?: number,
    height?: number,
    points?: {x: number, y: number}[],
    isTrigger?: boolean,
    collisionLayer?: number,
    collisionMask?: number,
    priority?: 'high' | 'medium' | 'low',
    lodLevel?: 'high' | 'medium' | 'low',
    enabled?: boolean
  } = {}
): ColliderComponent {
  return {
    type: 'collider',
    entityId,
    shape,
    radius: options.radius,
    width: options.width,
    height: options.height,
    points: options.points,
    isTrigger: options.isTrigger || false,
    collisionLayer: options.collisionLayer || 1,
    collisionMask: options.collisionMask || 1,
    priority: options.priority || 'high',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Create a health component
 */
export function createHealthComponent(
  entityId: EntityId,
  max: number = 100,
  options: {
    current?: number,
    regeneration?: number,
    invincible?: boolean,
    priority?: 'high' | 'medium' | 'low',
    lodLevel?: 'high' | 'medium' | 'low',
    enabled?: boolean
  } = {}
): HealthComponent {
  return {
    type: 'health',
    entityId,
    max,
    current: options.current !== undefined ? options.current : max,
    regeneration: options.regeneration || 0,
    invincible: options.invincible || false,
    priority: options.priority || 'high',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

// Export the component types for use in type checking
export type { 
  PositionComponent, 
  VelocityComponent, 
  RotationComponent, 
  ScaleComponent, 
  RenderableComponent, 
  ColliderComponent, 
  HealthComponent 
};
