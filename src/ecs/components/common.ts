
import { Component, ComponentType, EntityId, SystemPriority, LODLevel } from '../types';

/**
 * Position component for 2D entities
 */
export interface PositionComponent extends Component {
  type: 'position';
  x: number;
  y: number;
  z?: number;
}

/**
 * Create a position component
 * @param entityId Entity ID
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate (optional)
 * @returns Position component
 */
export function createPositionComponent(
  entityId: EntityId,
  x: number = 0,
  y: number = 0,
  z?: number,
  options: Partial<Pick<Component, 'priority' | 'lodLevel' | 'enabled'>> = {}
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
 * Velocity component for moving entities
 */
export interface VelocityComponent extends Component {
  type: 'velocity';
  vx: number;
  vy: number;
  vz?: number;
}

/**
 * Create a velocity component
 * @param entityId Entity ID
 * @param vx X velocity
 * @param vy Y velocity
 * @param vz Z velocity (optional)
 * @returns Velocity component
 */
export function createVelocityComponent(
  entityId: EntityId,
  vx: number = 0,
  vy: number = 0,
  vz?: number,
  options: Partial<Pick<Component, 'priority' | 'lodLevel' | 'enabled'>> = {}
): VelocityComponent {
  return {
    type: 'velocity',
    entityId,
    vx,
    vy,
    vz,
    priority: options.priority || 'high',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Rotation component for entities that can rotate
 */
export interface RotationComponent extends Component {
  type: 'rotation';
  angle: number; // in degrees
}

/**
 * Create a rotation component
 * @param entityId Entity ID
 * @param angle Rotation angle in degrees
 * @returns Rotation component
 */
export function createRotationComponent(
  entityId: EntityId,
  angle: number = 0,
  options: Partial<Pick<Component, 'priority' | 'lodLevel' | 'enabled'>> = {}
): RotationComponent {
  return {
    type: 'rotation',
    entityId,
    angle,
    priority: options.priority || 'medium',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Scale component for entities that can be scaled
 */
export interface ScaleComponent extends Component {
  type: 'scale';
  scaleX: number;
  scaleY: number;
}

/**
 * Create a scale component
 * @param entityId Entity ID
 * @param scaleX X scale
 * @param scaleY Y scale
 * @returns Scale component
 */
export function createScaleComponent(
  entityId: EntityId,
  scaleX: number = 1,
  scaleY: number = 1,
  options: Partial<Pick<Component, 'priority' | 'lodLevel' | 'enabled'>> = {}
): ScaleComponent {
  return {
    type: 'scale',
    entityId,
    scaleX,
    scaleY,
    priority: options.priority || 'medium',
    lodLevel: options.lodLevel || 'medium',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}

/**
 * Renderable component for entities that can be drawn
 */
export interface RenderableComponent extends Component {
  type: 'renderable';
  visible: boolean;
  zIndex: number;
  shape: 'circle' | 'rectangle' | 'triangle' | 'image';
  width: number;
  height: number;
  color?: string;
  opacity?: number;
  imageSrc?: string;
}

/**
 * Create a renderable component
 * @param entityId Entity ID
 * @param options Renderable options
 * @returns Renderable component
 */
export function createRenderableComponent(
  entityId: EntityId,
  options: Partial<Omit<RenderableComponent, 'type' | 'entityId' | 'priority' | 'lodLevel' | 'enabled'>> = {},
  componentOptions: Partial<Pick<Component, 'priority' | 'lodLevel' | 'enabled'>> = {}
): RenderableComponent {
  return {
    type: 'renderable',
    entityId,
    visible: options.visible ?? true,
    zIndex: options.zIndex ?? 0,
    shape: options.shape ?? 'rectangle',
    width: options.width ?? 50,
    height: options.height ?? 50,
    color: options.color ?? '#FF0000',
    opacity: options.opacity ?? 1,
    imageSrc: options.imageSrc,
    priority: componentOptions.priority || 'medium',
    lodLevel: componentOptions.lodLevel || 'high',
    enabled: componentOptions.enabled !== undefined ? componentOptions.enabled : true
  };
}

/**
 * Collider component for physics and collision detection
 */
export interface ColliderComponent extends Component {
  type: 'collider';
  shape: 'circle' | 'rectangle' | 'polygon';
  width?: number;
  height?: number;
  radius?: number;
  points?: Array<{x: number, y: number}>;
  isTrigger: boolean; // If true, detects collisions but doesn't resolve them
  layer: number; // Collision layer for filtering
  mask: number; // Collision mask for filtering
}

/**
 * Create a collider component
 * @param entityId Entity ID
 * @param shape Collider shape
 * @param options Additional collider options
 * @returns Collider component
 */
export function createColliderComponent(
  entityId: EntityId,
  shape: 'circle' | 'rectangle' | 'polygon',
  options: Partial<Omit<ColliderComponent, 'type' | 'entityId' | 'shape' | 'priority' | 'lodLevel' | 'enabled'>> = {},
  componentOptions: Partial<Pick<Component, 'priority' | 'lodLevel' | 'enabled'>> = {}
): ColliderComponent {
  return {
    type: 'collider',
    entityId,
    shape,
    width: options.width,
    height: options.height,
    radius: options.radius,
    points: options.points,
    isTrigger: options.isTrigger ?? false,
    layer: options.layer ?? 1,
    mask: options.mask ?? 0xFFFFFFFF, // All bits set by default
    priority: componentOptions.priority || 'high',
    lodLevel: componentOptions.lodLevel || 'high',
    enabled: componentOptions.enabled !== undefined ? componentOptions.enabled : true
  };
}

/**
 * Health component for entities with health/damage
 */
export interface HealthComponent extends Component {
  type: 'health';
  current: number;
  max: number;
  regeneration: number; // Health regenerated per second
  invincible: boolean;
}

/**
 * Create a health component
 * @param entityId Entity ID
 * @param maxHealth Maximum health
 * @param options Additional health options
 * @returns Health component
 */
export function createHealthComponent(
  entityId: EntityId,
  maxHealth: number = 100,
  options: Partial<Omit<HealthComponent, 'type' | 'entityId' | 'max' | 'priority' | 'lodLevel' | 'enabled'>> = {},
  componentOptions: Partial<Pick<Component, 'priority' | 'lodLevel' | 'enabled'>> = {}
): HealthComponent {
  return {
    type: 'health',
    entityId,
    current: options.current ?? maxHealth,
    max: maxHealth,
    regeneration: options.regeneration ?? 0,
    invincible: options.invincible ?? false,
    priority: componentOptions.priority || 'medium',
    lodLevel: componentOptions.lodLevel || 'medium',
    enabled: componentOptions.enabled !== undefined ? componentOptions.enabled : true
  };
}
