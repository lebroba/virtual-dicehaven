
import { useState, useEffect } from 'react';
import { ecs } from '../ECS';
import { System, SystemPriority, SystemPerformanceMetrics } from '../types';

/**
 * React hook for managing a system
 * @param name System name
 * @param executeFn System execute function
 * @param options Additional system options
 * @returns Object with system and methods to manipulate it
 */
export function useSystem(
  name: string,
  executeFn: System['execute'],
  options: {
    priority?: SystemPriority;
    enabled?: boolean;
    executeBeforeUpdate?: () => void;
    executeAfterUpdate?: () => void;
    dependencies?: string[];
    autoRemove?: boolean;
  } = {}
): {
  isRegistered: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  getPerformanceMetrics: () => SystemPerformanceMetrics | null;
} {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEnabled, setIsEnabledState] = useState(options.enabled ?? true);
  
  // Register system on mount
  useEffect(() => {
    const systemExists = ecs.getSystem(name) !== null;
    
    if (!systemExists) {
      const system: System = {
        name,
        execute: executeFn,
        priority: options.priority ?? 'medium',
        enabled: options.enabled ?? true,
        executeBeforeUpdate: options.executeBeforeUpdate,
        executeAfterUpdate: options.executeAfterUpdate,
        dependencies: options.dependencies
      };
      
      const registered = ecs.addSystem(system);
      setIsRegistered(registered);
    } else {
      setIsRegistered(true);
      const system = ecs.getSystem(name);
      setIsEnabledState(system?.enabled ?? false);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (options.autoRemove !== false) {
        ecs.removeSystem(name);
      }
    };
  }, [name, executeFn, options.priority, options.dependencies, options.autoRemove]);
  
  // Set enabled state
  const setEnabled = (enabled: boolean) => {
    const system = ecs.setSystemEnabled(name, enabled);
    if (system) {
      setIsEnabledState(system.enabled);
    }
  };
  
  // Get performance metrics
  const getPerformanceMetrics = () => {
    return ecs.getSystemPerformanceMetrics(name);
  };
  
  return {
    isRegistered,
    isEnabled,
    setEnabled,
    getPerformanceMetrics
  };
}
