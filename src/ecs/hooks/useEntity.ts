
import { useState, useEffect } from 'react';
import { ecs } from '../ECS';
import { Entity, EntityId, Component, ComponentType } from '../types';

/**
 * React hook for managing a specific entity
 * @param initialEntityId Optional entity ID to track, if not provided a new entity will be created
 * @param autoRemove If true, the entity will be removed when the component unmounts
 * @returns Object with entity and methods to manipulate it
 */
export function useEntity(initialEntityId?: EntityId, autoRemove: boolean = true): {
  entity: Entity | null;
  addComponent: <T extends Component>(component: T) => Entity | null;
  removeComponent: (componentType: ComponentType) => boolean;
  getComponent: <T extends Component>(componentType: ComponentType) => T | null;
  hasComponent: (componentType: ComponentType) => boolean;
  addTag: (tag: string) => Entity | null;
  removeTag: (tag: string) => boolean;
  hasTag: (tag: string) => boolean;
  setActive: (active: boolean) => Entity | null;
  isActive: () => boolean;
} {
  const [entityId, setEntityId] = useState<EntityId | undefined>(initialEntityId);
  const [entity, setEntity] = useState<Entity | null>(null);
  
  // Initialize entity
  useEffect(() => {
    let currentEntity: Entity | null = null;
    
    if (entityId !== undefined) {
      // Try to get existing entity
      currentEntity = ecs.getEntity(entityId);
    } else {
      // Create new entity
      currentEntity = ecs.createEntity();
      setEntityId(currentEntity.id);
    }
    
    setEntity(currentEntity);
    
    // Cleanup when component unmounts
    return () => {
      if (autoRemove && currentEntity) {
        ecs.removeEntity(currentEntity.id);
      }
    };
  }, [entityId, autoRemove]);
  
  // Helper methods
  const addComponent = <T extends Component>(component: T): Entity | null => {
    if (!entity) return null;
    
    const updatedEntity = ecs.addComponent(entity.id, component);
    if (updatedEntity) {
      setEntity(updatedEntity);
    }
    
    return updatedEntity;
  };
  
  const removeComponent = (componentType: ComponentType): boolean => {
    if (!entity) return false;
    
    const result = ecs.removeComponent(entity.id, componentType);
    if (result) {
      // Refresh entity
      setEntity(ecs.getEntity(entity.id));
    }
    
    return result;
  };
  
  const getComponent = <T extends Component>(componentType: ComponentType): T | null => {
    if (!entity) return null;
    
    return ecs.getComponent<T>(entity.id, componentType);
  };
  
  const hasComponent = (componentType: ComponentType): boolean => {
    if (!entity) return false;
    
    return ecs.hasComponent(entity.id, componentType);
  };
  
  const addTag = (tag: string): Entity | null => {
    if (!entity) return null;
    
    const updatedEntity = ecs.addTag(entity.id, tag);
    if (updatedEntity) {
      setEntity(updatedEntity);
    }
    
    return updatedEntity;
  };
  
  const removeTag = (tag: string): boolean => {
    if (!entity) return false;
    
    const result = ecs.removeTag(entity.id, tag);
    if (result) {
      // Refresh entity
      setEntity(ecs.getEntity(entity.id));
    }
    
    return result;
  };
  
  const hasTag = (tag: string): boolean => {
    if (!entity) return false;
    
    return ecs.hasTag(entity.id, tag);
  };
  
  const setActive = (active: boolean): Entity | null => {
    if (!entity) return null;
    
    const updatedEntity = ecs.setEntityActive(entity.id, active);
    if (updatedEntity) {
      setEntity(updatedEntity);
    }
    
    return updatedEntity;
  };
  
  const isActive = (): boolean => {
    return entity?.active ?? false;
  };
  
  return {
    entity,
    addComponent,
    removeComponent,
    getComponent,
    hasComponent,
    addTag,
    removeTag,
    hasTag,
    setActive,
    isActive
  };
}
