
import { EntityId, PositionComponent, VelocityComponent, RotationComponent, ScaleComponent, RenderableComponent, ColliderComponent, HealthComponent } from '../types';

/**
 * Create a position component
 */
export function createPositionComponent(
  entityId: EntityId,
  x: number,
  y: number,
  z?: number
): PositionComponent {
  return {
    type: 'position',
    entityId,
    x,
    y,
    z: z || 0,
    enabled: true
  };
}

/**
 * Create a velocity component
 */
export function createVelocityComponent(
  entityId: EntityId,
  vx: number,
  vy: number,
  vz?: number
): VelocityComponent {
  return {
    type: 'velocity',
    entityId,
    vx,
    vy,
    vz: vz || 0,
    enabled: true
  };
}

/**
 * Create a rotation component
 */
export function createRotationComponent(
  entityId: EntityId,
  angle: number,
  x?: number,
  y?: number,
  z?: number
): RotationComponent {
  return {
    type: 'rotation',
    entityId,
    angle,
    x: x || 0,
    y: y || 0,
    z: z || 0,
    enabled: true
  };
}

/**
 * Create a renderable component
 */
export function createRenderableComponent(
  entityId: EntityId,
  options: {
    mesh?: string;
    texture?: string;
    color?: string;
    visible?: boolean;
    opacity?: number;
    zIndex?: number;
  }
): RenderableComponent {
  return {
    type: 'renderable',
    entityId,
    mesh: options.mesh,
    texture: options.texture,
    color: options.color,
    visible: options.visible !== undefined ? options.visible : true,
    opacity: options.opacity !== undefined ? options.opacity : 1,
    zIndex: options.zIndex !== undefined ? options.zIndex : 0,
    enabled: true
  };
}

/**
 * Create a health component
 */
export function createHealthComponent(
  entityId: EntityId,
  current: number,
  max: number,
  regeneration: number = 0,
  invincible: boolean = false
): HealthComponent {
  return {
    type: 'health',
    entityId,
    current,
    max,
    regeneration,
    invincible,
    enabled: true
  };
}
