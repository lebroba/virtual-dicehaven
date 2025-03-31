
import { useCallback, useState, useEffect } from 'react';
import { ecs } from '../ECS';
import { System } from '../types';

/**
 * Hook for manipulating a specific system
 */
export const useSystem = (systemName: string) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  /**
   * Toggle system enabled/disabled
   */
  const toggleEnabled = useCallback(() => {
    const system = ecs.getSystem(systemName);
    
    if (system) {
      if (system.enabled) {
        ecs.setSystemEnabled(systemName, false);
      } else {
        ecs.setSystemEnabled(systemName, true);
      }
      setIsEnabled(!system.enabled);
    }
  }, [systemName]);
  
  /**
   * Enable the system
   */
  const enable = useCallback(() => {
    const result = ecs.setSystemEnabled(systemName, true);
    if (result) setIsEnabled(true);
    return result;
  }, [systemName]);
  
  /**
   * Disable the system
   */
  const disable = useCallback(() => {
    const result = ecs.setSystemEnabled(systemName, false);
    if (result) setIsEnabled(false);
    return result;
  }, [systemName]);
  
  /**
   * Get the system
   */
  const getSystem = useCallback((): System | undefined => {
    return ecs.getSystem(systemName);
  }, [systemName]);
  
  // Initialize the enabled state
  useEffect(() => {
    const system = ecs.getSystem(systemName);
    if (system) {
      setIsEnabled(system.enabled);
    }
  }, [systemName]);
  
  return {
    systemName,
    isEnabled,
    toggleEnabled,
    enable,
    disable,
    getSystem
  };
};
