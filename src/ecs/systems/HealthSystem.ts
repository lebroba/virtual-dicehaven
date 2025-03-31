
import { System, Entity, HealthComponent } from '../types';
import { ecs } from '../ECS';

/**
 * HealthSystem handles health regeneration and death
 */
export function createHealthSystem(): System {
  return {
    name: 'health',
    priority: 'medium',
    enabled: true,
    execute: (deltaTime: number, entities: Entity[]) => {
      // Find entities with health components
      const entitiesWithHealth = entities.filter(entity => {
        return entity.active && entity.components.has('health');
      });
      
      // Process each entity
      entitiesWithHealth.forEach(entity => {
        const health = entity.components.get('health') as HealthComponent;
        
        // Skip if component is disabled or entity is invincible
        if (health.enabled === false || health.invincible) return;
        
        // Handle regeneration
        if (health.regeneration > 0 && health.current < health.max) {
          health.current = Math.min(
            health.max,
            health.current + health.regeneration * deltaTime
          );
        }
        
        // Check for death
        if (health.current <= 0) {
          // Trigger a death event
          ecs.dispatchEvent({
            type: 'entity_died',
            sourceEntityId: entity.id,
            data: {
              causeOfDeath: 'health_depleted'
            }
          });
          
          // Mark entity as inactive
          ecs.setEntityActive(entity.id, false);
        }
      });
    }
  };
}
