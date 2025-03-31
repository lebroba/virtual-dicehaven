
import { useEffect } from 'react';
import { ecs } from '../ECS';
import { System } from '../types';

/**
 * React hook for managing a system in the ECS
 */
export function useSystem(
  system: System,
  autoEnable: boolean = true
): {
  enableSystem: () => void;
  disableSystem: () => void;
  isEnabled: () => boolean;
} {
  useEffect(() => {
    // Add system to the ECS
    ecs.addSystem(system);
    
    // Automatically enable/disable based on prop
    if (autoEnable) {
      ecs.enableSystem(system.name);
    } else {
      ecs.disableSystem(system.name);
    }
    
    // Remove system when component unmounts
    return () => {
      ecs.removeSystem(system.name);
    };
  }, []); // Empty dependency array to ensure this only runs once
  
  const enableSystem = () => {
    ecs.enableSystem(system.name);
  };
  
  const disableSystem = () => {
    ecs.disableSystem(system.name);
  };
  
  const isEnabled = () => {
    const systemInstance = ecs.getSystem(system.name);
    return systemInstance ? systemInstance.enabled : false;
  };
  
  return {
    enableSystem,
    disableSystem,
    isEnabled
  };
}
