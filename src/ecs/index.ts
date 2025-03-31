
// Export all ECS components for easy importing
export * from './types';
export * from './ECS';
export * from './ECSWorld';
export * from './EntityManager';
export * from './EntityRegistry';
export * from './ComponentManager';
export * from './SystemManager';
export * from './EventSystem';
export * from './SerializationSystem';
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

// Export the singleton instances
import { ecs } from './ECS';
import { world } from './ECSWorld';
export { ecs, world };
