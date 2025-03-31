
import { System } from '../types';
import { PositionComponent, VelocityComponent, RotationComponent } from '../components/common';
import { ShipComponent } from '../components/ship';

/**
 * ShipMovementSystem handles ship movement based on sail configuration and wind
 */
export function createShipMovementSystem(
  getWindDirection: () => number, 
  getWindSpeed: () => number
): System {
  return {
    name: 'shipMovement',
    priority: 'high',
    enabled: true,
    execute: (deltaTime, entities) => {
      // Current wind conditions
      const windDirection = getWindDirection(); // 0-359 degrees
      const windSpeed = getWindSpeed(); // in knots
      
      // Find entities with ship, position, velocity, and rotation components
      const shipEntities = entities.filter(entity => {
        return entity.active && 
               entity.components.has('ship') && 
               entity.components.has('position') && 
               entity.components.has('velocity') && 
               entity.components.has('rotation');
      });
      
      // Update each ship's velocity based on its sail configuration and the wind
      shipEntities.forEach(entity => {
        const ship = entity.components.get('ship') as ShipComponent;
        const position = entity.components.get('position') as PositionComponent;
        const velocity = entity.components.get('velocity') as VelocityComponent;
        const rotation = entity.components.get('rotation') as RotationComponent;
        
        // Skip if any required component is disabled
        if (!ship.enabled || !position.enabled || !velocity.enabled || !rotation.enabled) {
          return;
        }
        
        // Calculate sail effectiveness based on configuration and damage
        const sailEffect = calculateSailEffectiveness(ship);
        if (sailEffect === 0) {
          // No sails deployed or all masts damaged
          velocity.vx = 0;
          velocity.vy = 0;
          ship.speed.current = 0;
          return;
        }
        
        // Calculate the angle between wind direction and ship's heading
        const relativeWindAngle = calculateRelativeAngle(windDirection, rotation.angle);
        
        // Calculate wind effectiveness based on relative angle
        const windEffect = calculateWindEffect(relativeWindAngle);
        
        // Calculate rudder effectiveness based on damage
        const rudderEffect = 1 - (ship.damage.rudder / 100);
        
        // Calculate ship's speed
        const baseSpeed = ship.speed.max * sailEffect * windEffect * (windSpeed / 20);
        
        // Apply crew efficiency factor
        const crewEfficiency = ship.crew.current / ship.crew.max;
        ship.speed.current = baseSpeed * Math.max(0.3, crewEfficiency);
        
        // Convert ship's heading to radians
        const headingRad = (rotation.angle * Math.PI) / 180;
        
        // Calculate velocity components
        velocity.vx = Math.sin(headingRad) * ship.speed.current;
        velocity.vy = -Math.cos(headingRad) * ship.speed.current;
      });
    }
  };
}

/**
 * Calculate sail effectiveness based on configuration and damage
 * @param ship Ship component
 * @returns Sail effectiveness (0-1)
 */
function calculateSailEffectiveness(ship: ShipComponent): number {
  // Check sail configuration
  let configFactor;
  switch (ship.sails.configuration) {
    case 'full':
      configFactor = 1.0;
      break;
    case 'battle':
      configFactor = 0.7;
      break;
    case 'reduced':
      configFactor = 0.5;
      break;
    case 'minimal':
      configFactor = 0.3;
      break;
    case 'none':
      return 0;
    default:
      configFactor = 0;
  }
  
  // Calculate deployed sail percentage
  const deployedSails = (
    ship.sails.mainSails +
    ship.sails.topSails +
    ship.sails.jibs +
    ship.sails.spanker
  ) / 400; // Average of all sail types
  
  // Apply mast damage penalties
  const mastDamage = (
    ship.damage.masts.fore +
    ship.damage.masts.main +
    ship.damage.masts.mizzen
  ) / 300; // Average mast damage
  
  // Apply rigging damage penalty
  const riggingFactor = 1 - (ship.damage.rigging / 100);
  
  return configFactor * deployedSails * (1 - mastDamage) * riggingFactor;
}

/**
 * Calculate the relative angle between wind and ship heading
 * @param windDirection Wind direction in degrees (0-359)
 * @param shipHeading Ship heading in degrees (0-359)
 * @returns Relative angle in degrees (0-180)
 */
function calculateRelativeAngle(windDirection: number, shipHeading: number): number {
  // Normalize both angles
  const normalizedWind = ((windDirection % 360) + 360) % 360;
  const normalizedHeading = ((shipHeading % 360) + 360) % 360;
  
  // Calculate absolute difference
  let diff = Math.abs(normalizedWind - normalizedHeading);
  
  // Ensure the shortest angle
  if (diff > 180) {
    diff = 360 - diff;
  }
  
  return diff;
}

/**
 * Calculate wind effectiveness based on relative angle
 * Ships sail fastest with wind at 90-120 degrees to heading
 * Ships can't sail directly into the wind (within ~45 degrees)
 * @param relativeAngle Relative angle in degrees (0-180)
 * @returns Wind effectiveness factor (0-1)
 */
function calculateWindEffect(relativeAngle: number): number {
  // Dead into the wind (irons) - minimal movement
  if (relativeAngle < 45) {
    return 0.1;
  }
  
  // Close hauled (45-75 degrees) - increasing effectiveness
  if (relativeAngle < 75) {
    return 0.3 + (relativeAngle - 45) * 0.01;
  }
  
  // Beam reach / broad reach (75-150 degrees) - optimal sailing
  if (relativeAngle < 150) {
    return 0.6 + (relativeAngle - 75) * 0.005;
  }
  
  // Running (150-180 degrees) - good but not optimal
  return 1.0 - (relativeAngle - 150) * 0.005;
}
