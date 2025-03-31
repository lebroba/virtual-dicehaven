
import React, { useEffect } from 'react';
import { useECS } from '../hooks/useECS';
import { createShipComponent } from '../components/ship';
import { createPositionComponent, createVelocityComponent, createRotationComponent, createRenderableComponent } from '../components/common';
import { createMovementSystem } from '../systems/MovementSystem';
import { createShipMovementSystem } from '../systems/ShipMovementSystem';

/**
 * Example component showing how to set up a ship with the ECS
 */
export const ShipExample: React.FC = () => {
  const { ecs, createEntity, addComponent, startECS, stopECS } = useECS();
  
  useEffect(() => {
    // Set up systems
    const movementSystem = createMovementSystem();
    const shipMovementSystem = createShipMovementSystem();
    
    ecs.addSystem(movementSystem);
    ecs.addSystem(shipMovementSystem);
    
    // Create a ship entity
    const shipEntity = createEntity();
    
    // Add components to the ship
    addComponent(shipEntity.id, createPositionComponent(shipEntity.id, 0, 0));
    addComponent(shipEntity.id, createVelocityComponent(shipEntity.id, 0, 0));
    addComponent(shipEntity.id, createRotationComponent(shipEntity.id, 0));
    addComponent(shipEntity.id, createShipComponent(shipEntity.id, 'Frigate', 'British'));
    
    // Add a renderable component for visualization
    addComponent(shipEntity.id, createRenderableComponent(shipEntity.id, {
      texture: 'ship',
      visible: true,
      opacity: 1,
      zIndex: 1
    }));
    
    // Start the ECS
    startECS();
    
    // Cleanup on unmount
    return () => {
      stopECS();
    };
  }, []);
  
  return (
    <div className="p-4 border rounded bg-slate-800">
      <h3 className="text-lg font-semibold mb-2">Ship Example</h3>
      <p className="text-sm text-slate-300">
        A ship entity has been created and added to the ECS. Systems are running in the background.
      </p>
    </div>
  );
};
