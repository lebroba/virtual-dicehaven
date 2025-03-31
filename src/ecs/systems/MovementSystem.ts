
import { System } from '../types';
import { PositionComponent, VelocityComponent } from '../components/common';

/**
 * MovementSystem updates positions based on velocities
 */
export function createMovementSystem(): System {
  return {
    name: 'movement',
    priority: 'high',
    enabled: true,
    execute: (deltaTime, entities) => {
      // Find entities with both position and velocity components
      const movableEntities = entities.filter(entity => {
        return entity.active && 
               entity.components.has('position') && 
               entity.components.has('velocity');
      });
      
      // Update positions based on velocities
      movableEntities.forEach(entity => {
        const position = entity.components.get('position') as PositionComponent;
        const velocity = entity.components.get('velocity') as VelocityComponent;
        
        // Skip if either component is disabled
        if (!position.enabled || !velocity.enabled) return;
        
        // Update position based on velocity and deltaTime
        position.x += velocity.vx * deltaTime;
        position.y += velocity.vy * deltaTime;
        
        // Update Z position if it exists
        if (position.z !== undefined && velocity.vz !== undefined) {
          position.z += velocity.vz * deltaTime;
        }
      });
    }
  };
}
