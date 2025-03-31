import { Entity, EntityId, Component, SystemPriority, LODLevel } from './types';
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
  priority: string;
  lodLevel: string;
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
        priority: component.priority,
        lodLevel: component.lodLevel,
        enabled: component.enabled
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
      
      // Convert string values to the expected enum types
      const priorityValue = this.convertPriority(serializedComponent.priority);
      const lodLevelValue = this.convertLodLevel(serializedComponent.lodLevel);
      
      const component: Component = {
        type: serializedComponent.type,
        entityId: entity.id,
        priority: priorityValue,
        lodLevel: lodLevelValue,
        enabled: serializedComponent.enabled,
        ...componentData
      };
      
      entity.components.set(component.type, component);
    }
    
    return entity;
  }
  
  /**
   * Convert priority string to SystemPriority enum
   */
  private convertPriority(priorityStr: string): SystemPriority {
    switch (priorityStr) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        console.warn(`Unknown priority: ${priorityStr}, using 'medium' as default`);
        return 'medium';
    }
  }
  
  /**
   * Convert LOD level string to LODLevel enum
   */
  private convertLodLevel(lodLevelStr: string): LODLevel {
    switch (lodLevelStr) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        console.warn(`Unknown LOD level: ${lodLevelStr}, using 'medium' as default`);
        return 'medium';
    }
  }
  
  /**
   * Serialize all entities in the registry
   */
  serializeAllEntities(): SerializedEntity[] {
    const serializedEntities: SerializedEntity[] = [];
    
    for (const entity of this.entityRegistry.getAllEntities()) {
      const serializedEntity = this.serializeEntity(entity.id);
      if (serializedEntity) {
        serializedEntities.push(serializedEntity);
      }
    }
    
    return serializedEntities;
  }
  
  /**
   * Deserialize multiple entities
   */
  deserializeEntities(serializedEntities: SerializedEntity[]): Entity[] {
    const entities: Entity[] = [];
    
    for (const serializedEntity of serializedEntities) {
      const entity = this.deserializeEntity(serializedEntity);
      if (entity) {
        entities.push(entity);
      }
    }
    
    return entities;
  }
  
  /**
   * Save all entities to localStorage
   */
  saveToLocalStorage(key: string = 'ecs-entities'): void {
    const serialized = this.serializeAllEntities();
    try {
      localStorage.setItem(key, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save entities to localStorage:', error);
    }
  }
  
  /**
   * Load entities from localStorage
   */
  loadFromLocalStorage(key: string = 'ecs-entities'): Entity[] {
    try {
      const serializedData = localStorage.getItem(key);
      if (!serializedData) {
        return [];
      }
      
      const serializedEntities = JSON.parse(serializedData);
      return this.deserializeEntities(serializedEntities);
    } catch (error) {
      console.error('Failed to load entities from localStorage:', error);
      return [];
    }
  }
  
  /**
   * Export entities to a JSON string
   */
  exportToJSON(): string {
    return JSON.stringify(this.serializeAllEntities());
  }
  
  /**
   * Import entities from a JSON string
   */
  importFromJSON(json: string): Entity[] {
    try {
      const serializedEntities = JSON.parse(json);
      return this.deserializeEntities(serializedEntities);
    } catch (error) {
      console.error('Failed to import entities from JSON:', error);
      return [];
    }
  }
}
