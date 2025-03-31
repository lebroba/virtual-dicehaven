
import { useCallback } from 'react';
import { ecs } from '../ECS';
import { Entity, Component } from '../types';

/**
 * Hook for manipulating a specific entity
 */
export const useEntity = (entityId: number) => {
  /**
   * Add a component to the entity
   */
  const addComponent = useCallback((component: Component) => {
    return ecs.addComponent(entityId, component);
  }, [entityId]);
  
  /**
   * Remove a component from the entity
   */
  const removeComponent = useCallback((componentType: string) => {
    return ecs.removeComponent(entityId, componentType);
  }, [entityId]);
  
  /**
   * Get a component from the entity
   */
  const getComponent = useCallback(<T extends Component>(componentType: string): T | undefined => {
    return ecs.getComponent<T>(entityId, componentType);
  }, [entityId]);
  
  /**
   * Check if entity exists
   */
  const entityExists = useCallback((): boolean => {
    return ecs.getEntity(entityId) !== undefined;
  }, [entityId]);
  
  /**
   * Get the entity
   */
  const getEntity = useCallback((): Entity | undefined => {
    return ecs.getEntity(entityId);
  }, [entityId]);
  
  /**
   * Check if entity has a component
   */
  const hasComponent = useCallback((componentType: string): boolean => {
    return ecs.hasComponent(entityId, componentType);
  }, [entityId]);
  
  /**
   * Add a tag to the entity
   */
  const addTag = useCallback((tag: string) => {
    ecs.addTag(entityId, tag);
    return ecs.getEntity(entityId) !== undefined;
  }, [entityId]);
  
  /**
   * Remove a tag from the entity
   */
  const removeTag = useCallback((tag: string) => {
    ecs.removeTag(entityId, tag);
    return ecs.getEntity(entityId) !== undefined;
  }, [entityId]);
  
  /**
   * Check if entity has a tag
   */
  const hasTag = useCallback((tag: string): boolean => {
    return ecs.hasTag(entityId, tag);
  }, [entityId]);
  
  /**
   * Set entity active state
   */
  const setActive = useCallback((active: boolean) => {
    ecs.setEntityActive(entityId, active);
    return ecs.getEntity(entityId) !== undefined;
  }, [entityId]);
  
  return {
    entityId,
    addComponent,
    removeComponent,
    getComponent,
    hasComponent,
    entityExists,
    getEntity,
    addTag,
    removeTag,
    hasTag,
    setActive
  };
};
