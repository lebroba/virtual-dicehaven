
import { System } from '../types';
import { PositionComponent, VelocityComponent, RotationComponent } from '../types';
import { ShipComponent } from '../types';

/**
 * ShipMovementSystem handles ship specific movement mechanics
 */
export function createShipMovementSystem(): System {
  return {
    name: 'shipMovement',
    priority: 'high',
    enabled: true,
    dependencies: ['movement'], // Run after the basic movement system
    execute: (deltaTime, entities) => {
      // Find ship entities with position and velocity
      const shipEntities = entities.filter(entity => {
        return entity.active && 
               entity.components.has('ship') &&
               entity.components.has('position') && 
               entity.components.has('velocity');
      });
      
      // Process each ship
      shipEntities.forEach(entity => {
        const ship = entity.components.get('ship') as ShipComponent;
        const position = entity.components.get('position') as PositionComponent;
        const velocity = entity.components.get('velocity') as VelocityComponent;
        const rotation = entity.components.get('rotation') as RotationComponent | undefined;
        
        // Skip if components are disabled
        if (ship.enabled === false || position.enabled === false || velocity.enabled === false) {
          return;
        }
        
        // Calculate ship physics based on sail configuration, damage, etc.
        let speedFactor = 0;
        
        // Calculate speed factor based on sail configuration
        switch(ship.sails.configuration) {
          case 'full':
            speedFactor = 1.0;
            break;
          case 'battle':
            speedFactor = 0.7;
            break;
          case 'reduced':
            speedFactor = 0.4;
            break;
          case 'minimal':
            speedFactor = 0.2;
            break;
          case 'none':
            speedFactor = 0;
            break;
        }
        
        // Apply sail damage reduction
        const riggingDamage = Math.min(ship.damage.rigging, 100) / 100;
        speedFactor *= (1 - riggingDamage * 0.8);
        
        // Apply hull damage reduction
        const hullDamage = Math.min(ship.damage.hull, 100) / 100;
        speedFactor *= (1 - hullDamage * 0.3);
        
        // Apply rudder damage reduction to turning
        const rudderDamage = Math.min(ship.damage.rudder, 100) / 100;
        let turnFactor = 1 - rudderDamage * 0.9;
        
        // Adjust ship's current speed based on all factors
        const targetSpeed = ship.speed.max * speedFactor;
        
        // Gradually adjust current speed toward target speed
        if (ship.speed.current < targetSpeed) {
          ship.speed.current = Math.min(ship.speed.current + deltaTime * 0.5, targetSpeed);
        } else if (ship.speed.current > targetSpeed) {
          ship.speed.current = Math.max(ship.speed.current - deltaTime * 0.8, targetSpeed);
        }
        
        // Apply rotation if available
        if (rotation) {
          // Calculate velocity based on ship's rotation and speed
          const radians = rotation.angle * Math.PI / 180;
          velocity.vx = Math.sin(radians) * ship.speed.current;
          velocity.vy = -Math.cos(radians) * ship.speed.current;
        }
      });
    }
  };
}
