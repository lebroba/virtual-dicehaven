
import React, { useEffect } from 'react';
import { ecs } from '../ECS';
import { 
  createPositionComponent, 
  createVelocityComponent, 
  createRotationComponent, 
  createHealthComponent 
} from '../components/common';
import { createShipComponent } from '../components/ship';
import { EntityId } from '../types';

export const createShipEntity = () => {
  // Create a new entity without passing any arguments
  const entity = ecs.createEntity();
  const entityId = entity.id;
  
  // Convert EntityId to number for components that require it
  const numericId = typeof entityId === 'string' ? parseInt(entityId, 10) : entityId;
  
  // Add components with proper typing for entityId
  ecs.addComponent(
    numericId,
    createPositionComponent(entityId, 100, 100)
  );
  
  ecs.addComponent(
    numericId,
    createVelocityComponent(entityId, 0, 0)
  );
  
  ecs.addComponent(
    numericId,
    createRotationComponent(entityId, 0)
  );
  
  ecs.addComponent(
    numericId,
    createHealthComponent(entityId, 100, 100, 0.1)
  );
  
  ecs.addComponent(
    numericId,
    createShipComponent(entityId, 'FifthRate', 'British')
  );
  
  return entity;
};

const ShipExample: React.FC = () => {
  useEffect(() => {
    // Create a ship entity when the component mounts
    const ship = createShipEntity();
    
    return () => {
      // Clean up the entity when the component unmounts
      if (ship && ship.id) {
        // Convert EntityId to number if needed
        const numericId = typeof ship.id === 'string' ? parseInt(ship.id, 10) : ship.id;
        ecs.removeEntity(numericId);
      }
    };
  }, []);
  
  return (
    <div>
      <h2>Ship Example</h2>
      <p>A ship entity has been created in the ECS system.</p>
    </div>
  );
};

export default ShipExample;
