import { Entity, EntityId, Component, ComponentType, SystemPriority, LODLevel } from './types';
import { EntityRegistry } from './EntityRegistry';
import { ComponentManager } from './ComponentManager';

export interface SerializedEntity {
  id: EntityId;
  active: boolean;
  tags: string[];
  components: SerializedComponent[];
}

export interface SerializedComponent {
  type: string;
  priority: SystemPriority;
  lodLevel: LODLevel;
  enabled: boolean;
  [key: string]: any;
}

export class SerializationSystem {
  private entityRegistry: EntityRegistry;
  private componentManager: ComponentManager;
  
  constructor(entityRegistry: EntityRegistry, componentManager: ComponentManager) {
    this.entityRegistry = entityRegistry;
    this.componentManager = componentManager;
  }
  
  /**
   * Serialize a single entity
   */
  serializeEntity(entityId: EntityId): SerializedEntity | null {
    const entity = this.entityRegistry.getEntity(entityId);
    
    if (!entity) {
      return null;
    }
    
    const serializedComponents: SerializedComponent[] = [];
    
    for (const component of entity.components.values()) {
      const serializedComponent: SerializedComponent = {
        type: component.type,
        priority: component.priority || 'medium',
        lodLevel: component.lodLevel || 'medium',
        enabled: component.enabled !== false // Default to true if not specified
      };
      
      // Copy all other properties (excluding internal ones)
      for (const [key, value] of Object.entries(component)) {
        if (!['type', 'entityId', 'priority', 'lodLevel', 'enabled'].includes(key)) {
          serializedComponent[key] = value;
        }
      }
      
      serializedComponents.push(serializedComponent);
    }
    
    return {
      id: entity.id,
      active: entity.active,
      tags: Array.from(entity.tags),
      components: serializedComponents
    };
  }
  
  /**
   * Deserialize an entity
   */
  deserializeEntity(serializedEntity: SerializedEntity): Entity | null {
    // Check if entity already exists
    let entity = this.entityRegistry.getEntity(serializedEntity.id);
    
    if (entity) {
      // Update existing entity
      entity.active = serializedEntity.active;
      entity.tags = new Set(serializedEntity.tags);
      entity.components.clear(); // Remove existing components
    } else {
      // Create new entity with specified ID
      entity = {
        id: serializedEntity.id,
        components: new Map(),
        active: serializedEntity.active,
        tags: new Set(serializedEntity.tags)
      };
      
      // Add to registry (this is a bit of a hack as we're bypassing the registry's ID generation)
      (this.entityRegistry as any).entities.set(entity.id, entity);
    }
    
    // Add components
    for (const serializedComponent of serializedEntity.components) {
      const componentData = { ...serializedComponent };
      
      // Remove properties that are handled separately
      delete componentData.type;
      delete componentData.priority;
      delete componentData.lodLevel;
      delete componentData.enabled;
      
      const component: Component = {
        type: serializedComponent.type,
        entityId: entity.id,
        priority: serializedComponent.priority,
        lodLevel: serializedComponent.lodLevel,
        enabled: serializedComponent.enabled,
        ...componentData
      };
      
      entity.components.set(component.type, component);
    }
    
    return entity;
  }
  
  /**
   * Save the current state to local storage
   */
  saveToLocalStorage(key: string = 'ecs-state'): void {
    const serializedEntities: SerializedEntity[] = [];
    
    for (const entity of this.entityRegistry.getAllEntities()) {
      const serializedEntity = this.serializeEntity(entity.id);
      if (serializedEntity) {
        serializedEntities.push(serializedEntity);
      }
    }
    
    localStorage.setItem(key, JSON.stringify(serializedEntities));
  }
  
  /**
   * Load state from local storage
   */
  loadFromLocalStorage(key: string = 'ecs-state'): Entity[] {
    const json = localStorage.getItem(key);
    
    if (!json) {
      return [];
    }
    
    try {
      const serializedEntities: SerializedEntity[] = JSON.parse(json);
      const entities: Entity[] = [];
      
      for (const serializedEntity of serializedEntities) {
        const entity = this.deserializeEntity(serializedEntity);
        if (entity) {
          entities.push(entity);
        }
      }
      
      return entities;
    } catch (error) {
      console.error('Error loading state from local storage:', error);
      return [];
    }
  }
  
  /**
   * Export the current state to JSON
   */
  exportToJSON(): string {
    const serializedEntities: SerializedEntity[] = [];
    
    for (const entity of this.entityRegistry.getAllEntities()) {
      const serializedEntity = this.serializeEntity(entity.id);
      if (serializedEntity) {
        serializedEntities.push(serializedEntity);
      }
    }
    
    return JSON.stringify(serializedEntities);
  }
  
  /**
   * Import state from JSON
   */
  importFromJSON(json: string): Entity[] {
    try {
      const serializedEntities: SerializedEntity[] = JSON.parse(json);
      const entities: Entity[] = [];
      
      for (const serializedEntity of serializedEntities) {
        const entity = this.deserializeEntity(serializedEntity);
        if (entity) {
          entities.push(entity);
        }
      }
      
      return entities;
    } catch (error) {
      console.error('Error importing state from JSON:', error);
      return [];
    }
  }
}
