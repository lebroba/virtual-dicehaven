
// Export all ECS components for easy importing
export * from './types';
export * from './ECS';
export * from './EntityManager';
export * from './EntityRegistry';
export * from './ComponentManager';
export * from './SystemManager';
export * from './components/common';
export * from './components/ship';
export * from './systems/MovementSystem';
export * from './systems/RenderSystem';
export * from './systems/HealthSystem';
export * from './systems/ShipMovementSystem';
export * from './hooks/useECS';
export * from './hooks/useEntity';
export * from './hooks/useSystem';
export * from './examples/ShipExample';

// Export the singleton instance
import { ecs } from './ECS';
export { ecs };
