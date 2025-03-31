
import { useState, useEffect, useCallback } from 'react';
import { ecs } from '../ECS';
import { Entity, Component, System, SystemPerformanceMetrics } from '../types';

/**
 * Hook for accessing the ECS system
 */
export const useECS = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<SystemPerformanceMetrics[]>([]);
  
  // Start the ECS
  const startECS = useCallback(() => {
    ecs.start();
    setIsRunning(true);
  }, []);
  
  // Stop the ECS
  const stopECS = useCallback(() => {
    ecs.stop();
    setIsRunning(false);
  }, []);
  
  // Create a new entity
  const createEntity = useCallback(() => {
    const entity = ecs.createEntity();
    setEntities([...ecs.getEntityRegistry().queryEntities({ active: true })]);
    return entity;
  }, []);
  
  // Remove an entity
  const removeEntity = useCallback((entityId: number) => {
    const result = ecs.removeEntity(entityId);
    if (result) {
      setEntities([...ecs.getEntityRegistry().queryEntities({ active: true })]);
    }
    return result;
  }, []);
  
  // Get entity by ID
  const getEntity = useCallback((entityId: number) => {
    return ecs.getEntity(entityId);
  }, []);
  
  // Add a component to an entity
  const addComponent = useCallback((entityId: number, component: Component) => {
    const result = ecs.addComponent(entityId, component);
    if (result) {
      setEntities([...ecs.getEntityRegistry().queryEntities({ active: true })]);
    }
    return result;
  }, []);
  
  // Reset the ECS
  const resetECS = useCallback(() => {
    ecs.reset();
    setEntities([]);
    setPerformanceMetrics([]);
    setIsRunning(false);
  }, []);
  
  // Update the performance metrics
  const updatePerformanceMetrics = useCallback(() => {
    setPerformanceMetrics(ecs.getAllSystemPerformanceMetrics());
  }, []);
  
  // Update the entities list
  const updateEntities = useCallback(() => {
    setEntities([...ecs.getEntityRegistry().queryEntities({ active: true })]);
  }, []);
  
  // Register a system
  const registerSystem = useCallback((system: System) => {
    ecs.addSystem(system);
  }, []);
  
  // Save the current state
  const saveState = useCallback((key?: string) => {
    ecs.saveState(key);
  }, []);
  
  // Load a saved state
  const loadState = useCallback((key?: string) => {
    const loadedEntities = ecs.loadState(key);
    setEntities([...ecs.getEntityRegistry().queryEntities({ active: true })]);
    return loadedEntities;
  }, []);
  
  // Export state to JSON
  const exportState = useCallback(() => {
    return ecs.exportToJSON();
  }, []);
  
  // Import state from JSON
  const importState = useCallback((json: string) => {
    const entities = ecs.importFromJSON(json);
    setEntities([...ecs.getEntityRegistry().queryEntities({ active: true })]);
    return entities;
  }, []);
  
  // Update entities and metrics periodically when running
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      updateEntities();
      updatePerformanceMetrics();
    }, 1000); // Update once per second
    
    return () => clearInterval(interval);
  }, [isRunning, updateEntities, updatePerformanceMetrics]);
  
  return {
    ecs,
    isRunning,
    entities,
    performanceMetrics,
    startECS,
    stopECS,
    resetECS,
    createEntity,
    removeEntity,
    getEntity,
    addComponent,
    registerSystem,
    saveState,
    loadState,
    exportState,
    importState
  };
};
