import { Entity, EntityId, EntityQuery, Component, ComponentType } from './types';

export class EntityRegistry {
  private entities: Map<EntityId, Entity> = new Map();
  private nextEntityId: EntityId = 1;
  
  constructor() {}
  
  /**
   * Clear all entities
   */
  clear(): void {
    this.entities.clear();
    this.nextEntityId = 1;
  }
  
  /**
   * Create a new entity
   */
  createEntity(tags: string[] = []): Entity {
    const entity: Entity = {
      id: this.nextEntityId++,
      components: new Map(),
      active: true,
      tags: new Set(tags)
    };
    
    this.entities.set(entity.id, entity);
    return entity;
  }
  
  /**
   * Remove an entity and all its components
   */
  removeEntity(entityId: EntityId): boolean {
    return this.entities.delete(entityId);
  }
  
  /**
   * Get entity by ID
   */
  getEntity(entityId: EntityId): Entity | undefined {
    return this.entities.get(entityId);
  }
  
  /**
   * Get all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  /**
   * Query entities based on components and tags
   */
  queryEntities(query: EntityQuery): Entity[] {
    return Array.from(this.entities.values()).filter(entity => {
      // Skip inactive entities if active flag is true
      if (query.active === true && !entity.active) {
        return false;
      }
      
      // Check required components
      if (query.withComponents && query.withComponents.length > 0) {
        if (!query.withComponents.every(type => entity.components.has(type))) {
          return false;
        }
      }
      
      // Check excluded components
      if (query.withoutComponents && query.withoutComponents.length > 0) {
        if (query.withoutComponents.some(type => entity.components.has(type))) {
          return false;
        }
      }
      
      // Check required tags
      if (query.withTags && query.withTags.length > 0) {
        if (!query.withTags.every(tag => entity.tags.has(tag))) {
          return false;
        }
      }
      
      // Check excluded tags
      if (query.withoutTags && query.withoutTags.length > 0) {
        if (query.withoutTags.some(tag => entity.tags.has(tag))) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Activate or deactivate an entity
   */
  setEntityActive(entityId: EntityId, active: boolean): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.active = active;
    }
  }
  
  /**
   * Add a tag to an entity
   */
  addTag(entityId: EntityId, tag: string): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.tags.add(tag);
    }
  }
  
  /**
   * Remove a tag from an entity
   */
  removeTag(entityId: EntityId, tag: string): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.tags.delete(tag);
    }
  }
  
  /**
   * Check if an entity has a specific tag
   */
  hasTag(entityId: EntityId, tag: string): boolean {
    const entity = this.entities.get(entityId);
    return entity ? entity.tags.has(tag) : false;
  }
  
  /**
   * Count total entities in the registry
   */
  count(): number {
    return this.entities.size;
  }
}
