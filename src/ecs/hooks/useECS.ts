
import { useEffect, useState } from 'react';
import { ecs, ECS } from '../ECS';
import { Entity, System, Component, EntityId, EntityQuery, SystemPerformanceMetrics } from '../types';

/**
 * React hook for using the ECS system in components
 */
export function useECS(): {
  ecs: ECS;
  createEntity: () => Entity;
  addComponent: (entityId: EntityId, component: Component) => Entity | null;
  removeEntity: (entityId: EntityId) => boolean;
  queryEntities: (query: EntityQuery) => Entity[];
  addSystem: (system: System) => boolean;
  removeSystem: (systemName: string) => boolean;
  startECS: () => void;
  stopECS: () => void;
  resetECS: () => void;
  getPerformanceMetrics: () => SystemPerformanceMetrics[];
} {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize ECS on first render
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
    
    // Cleanup when component unmounts
    return () => {
      // Don't automatically stop ECS as other components might be using it
      // Individual components should manage their own systems
    };
  }, [isInitialized]);
  
  // Helper methods that wrap the ECS API
  const createEntity = () => ecs.createEntity();
  
  const addComponent = (entityId: EntityId, component: Component) => 
    ecs.addComponent(entityId, component);
  
  const removeEntity = (entityId: EntityId) => 
    ecs.removeEntity(entityId);
  
  const queryEntities = (query: EntityQuery) => 
    ecs.queryEntities(query);
  
  const addSystem = (system: System) => 
    ecs.addSystem(system);
  
  const removeSystem = (systemName: string) => 
    ecs.removeSystem(systemName);
  
  const startECS = () => ecs.start();
  
  const stopECS = () => ecs.stop();
  
  const resetECS = () => ecs.reset();
  
  const getPerformanceMetrics = () => 
    ecs.getAllSystemPerformanceMetrics();
  
  return {
    ecs,
    createEntity,
    addComponent,
    removeEntity,
    queryEntities,
    addSystem,
    removeSystem,
    startECS,
    stopECS,
    resetECS,
    getPerformanceMetrics
  };
}
