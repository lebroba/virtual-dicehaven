
import { useEffect, useState } from 'react';
import { ecs } from '../ECS';
import { Component, Entity, EntityId } from '../types';

/**
 * React hook for managing a single entity
 */
export function useEntity(
  initialTags: string[] = [],
  initialComponents: Component[] = []
): {
  entity: Entity | null;
  entityId: EntityId | null;
  addComponent: (component: Component) => void;
  removeComponent: (componentType: string) => void;
  getComponent: <T extends Component>(componentType: string) => T | undefined;
  hasComponent: (componentType: string) => boolean;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  hasTag: (tag: string) => boolean;
  setActive: (active: boolean) => void;
} {
  const [entity, setEntity] = useState<Entity | null>(null);
  
  // Create entity on first render
  useEffect(() => {
    // Create entity with initial tags
    const newEntity = ecs.createEntity(initialTags);
    
    // Add initial components
    initialComponents.forEach(component => {
      ecs.addComponent(newEntity.id, component);
    });
    
    setEntity(newEntity);
    
    // Clean up entity when component unmounts
    return () => {
      if (newEntity) {
        ecs.removeEntity(newEntity.id);
      }
    };
  }, []); // Empty dependency array ensures this only runs once
  
  const entityId = entity?.id || null;
  
  // Component operations
  const addComponent = (component: Component) => {
    if (entity) {
      ecs.addComponent(entity.id, component);
      // Update local entity reference
      setEntity(ecs.getEntity(entity.id) || null);
    }
  };
  
  const removeComponent = (componentType: string) => {
    if (entity) {
      ecs.removeComponent(entity.id, componentType);
      // Update local entity reference
      setEntity(ecs.getEntity(entity.id) || null);
    }
  };
  
  const getComponent = <T extends Component>(componentType: string): T | undefined => {
    if (!entity) return undefined;
    return ecs.getComponent<T>(entity.id, componentType);
  };
  
  const hasComponent = (componentType: string): boolean => {
    if (!entity) return false;
    return ecs.hasComponent(entity.id, componentType);
  };
  
  // Tag operations
  const addTag = (tag: string) => {
    if (entity) {
      ecs.addTag(entity.id, tag);
      // Update local entity reference
      setEntity(ecs.getEntity(entity.id) || null);
    }
  };
  
  const removeTag = (tag: string) => {
    if (entity) {
      ecs.removeTag(entity.id, tag);
      // Update local entity reference
      setEntity(ecs.getEntity(entity.id) || null);
    }
  };
  
  const hasTag = (tag: string): boolean => {
    if (!entity) return false;
    return ecs.hasTag(entity.id, tag);
  };
  
  // Set active state
  const setActive = (active: boolean) => {
    if (entity) {
      ecs.setEntityActive(entity.id, active);
      // Update local entity reference
      setEntity(ecs.getEntity(entity.id) || null);
    }
  };
  
  return {
    entity,
    entityId,
    addComponent,
    removeComponent,
    getComponent,
    hasComponent,
    addTag,
    removeTag,
    hasTag,
    setActive
  };
}
