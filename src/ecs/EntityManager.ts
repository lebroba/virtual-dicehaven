
import { Entity, EntityId, Component, ComponentType, EntityQuery, EntityEvent, EntityEventCallback } from './types';

/**
 * Manages all entities in the ECS system
 */
export class EntityManager {
  private entities: Map<EntityId, Entity> = new Map();
  private nextEntityId: EntityId = 1;
  private eventListeners: Map<string, Map<EntityId, EntityEventCallback[]>> = new Map();
  
  /**
   * Create a new entity
   * @returns The created entity
   */
  createEntity(): Entity {
    const id = this.nextEntityId++;
    const entity: Entity = {
      id,
      components: new Map(),
      active: true,
      tags: new Set()
    };
    
    this.entities.set(id, entity);
    return entity;
  }
  
  /**
   * Add a component to an entity
   * @param entityId The entity ID
   * @param component The component to add
   * @returns The updated entity, or null if entity doesn't exist
   */
  addComponent(entityId: EntityId, component: Component): Entity | null {
    const entity = this.entities.get(entityId);
    if (!entity) return null;
    
    component.entityId = entityId;
    entity.components.set(component.type, component);
    return entity;
  }
  
  /**
   * Remove a component from an entity
   * @param entityId The entity ID
   * @param componentType The component type to remove
   * @returns True if component was removed, false if not found or entity doesn't exist
   */
  removeComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    return entity.components.delete(componentType);
  }
  
  /**
   * Get a component from an entity
   * @param entityId The entity ID
   * @param componentType The component type to get
   * @returns The component, or null if not found or entity doesn't exist
   */
  getComponent<T extends Component>(entityId: EntityId, componentType: ComponentType): T | null {
    const entity = this.entities.get(entityId);
    if (!entity) return null;
    
    const component = entity.components.get(componentType);
    return component as T || null;
  }
  
  /**
   * Check if an entity has a specific component
   * @param entityId The entity ID
   * @param componentType The component type to check
   * @returns True if entity has the component, false otherwise
   */
  hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    return entity.components.has(componentType);
  }
  
  /**
   * Get an entity by its ID
   * @param entityId The entity ID
   * @returns The entity, or null if not found
   */
  getEntity(entityId: EntityId): Entity | null {
    return this.entities.get(entityId) || null;
  }
  
  /**
   * Remove an entity and all its components
   * @param entityId The entity ID
   * @returns True if entity was removed, false if not found
   */
  removeEntity(entityId: EntityId): boolean {
    // Remove all event listeners for this entity
    this.eventListeners.forEach((entityListeners) => {
      entityListeners.delete(entityId);
    });
    
    return this.entities.delete(entityId);
  }
  
  /**
   * Set an entity's active state
   * @param entityId The entity ID
   * @param active The active state
   * @returns The updated entity, or null if entity doesn't exist
   */
  setEntityActive(entityId: EntityId, active: boolean): Entity | null {
    const entity = this.entities.get(entityId);
    if (!entity) return null;
    
    entity.active = active;
    return entity;
  }
  
  /**
   * Add a tag to an entity
   * @param entityId The entity ID
   * @param tag The tag to add
   * @returns The updated entity, or null if entity doesn't exist
   */
  addTag(entityId: EntityId, tag: string): Entity | null {
    const entity = this.entities.get(entityId);
    if (!entity) return null;
    
    entity.tags.add(tag);
    return entity;
  }
  
  /**
   * Remove a tag from an entity
   * @param entityId The entity ID
   * @param tag The tag to remove
   * @returns True if tag was removed, false if not found or entity doesn't exist
   */
  removeTag(entityId: EntityId, tag: string): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    return entity.tags.delete(tag);
  }
  
  /**
   * Check if an entity has a specific tag
   * @param entityId The entity ID
   * @param tag The tag to check
   * @returns True if entity has the tag, false otherwise
   */
  hasTag(entityId: EntityId, tag: string): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    return entity.tags.has(tag);
  }
  
  /**
   * Query for entities matching specific criteria
   * @param query The query criteria
   * @returns Array of entities matching the criteria
   */
  queryEntities(query: EntityQuery): Entity[] {
    return Array.from(this.entities.values()).filter(entity => {
      // Filter by active state if specified
      if (query.active !== undefined && entity.active !== query.active) {
        return false;
      }
      
      // Filter by required components
      if (query.withComponents && query.withComponents.length > 0) {
        for (const componentType of query.withComponents) {
          if (!entity.components.has(componentType)) {
            return false;
          }
        }
      }
      
      // Filter by excluded components
      if (query.withoutComponents && query.withoutComponents.length > 0) {
        for (const componentType of query.withoutComponents) {
          if (entity.components.has(componentType)) {
            return false;
          }
        }
      }
      
      // Filter by required tags
      if (query.withTags && query.withTags.length > 0) {
        for (const tag of query.withTags) {
          if (!entity.tags.has(tag)) {
            return false;
          }
        }
      }
      
      // Filter by excluded tags
      if (query.withoutTags && query.withoutTags.length > 0) {
        for (const tag of query.withoutTags) {
          if (entity.tags.has(tag)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }
  
  /**
   * Get all entities
   * @returns Array of all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  /**
   * Register an event listener for a specific entity
   * @param entityId The entity ID
   * @param eventType The event type
   * @param callback The callback function
   */
  addEventListener(entityId: EntityId, eventType: string, callback: EntityEventCallback): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Map());
    }
    
    const eventTypeListeners = this.eventListeners.get(eventType)!;
    if (!eventTypeListeners.has(entityId)) {
      eventTypeListeners.set(entityId, []);
    }
    
    eventTypeListeners.get(entityId)!.push(callback);
  }
  
  /**
   * Remove an event listener for a specific entity
   * @param entityId The entity ID
   * @param eventType The event type
   * @param callback The callback function to remove
   * @returns True if listener was removed, false if not found
   */
  removeEventListener(entityId: EntityId, eventType: string, callback: EntityEventCallback): boolean {
    const eventTypeListeners = this.eventListeners.get(eventType);
    if (!eventTypeListeners) return false;
    
    const entityListeners = eventTypeListeners.get(entityId);
    if (!entityListeners) return false;
    
    const index = entityListeners.indexOf(callback);
    if (index === -1) return false;
    
    entityListeners.splice(index, 1);
    
    // Clean up empty arrays and maps
    if (entityListeners.length === 0) {
      eventTypeListeners.delete(entityId);
    }
    if (eventTypeListeners.size === 0) {
      this.eventListeners.delete(eventType);
    }
    
    return true;
  }
  
  /**
   * Trigger an event for a specific entity
   * @param event The event to trigger
   */
  triggerEvent(event: EntityEvent): void {
    const eventTypeListeners = this.eventListeners.get(event.type);
    if (!eventTypeListeners) return;
    
    // Notify listeners on the source entity
    const sourceListeners = eventTypeListeners.get(event.sourceEntityId);
    if (sourceListeners) {
      sourceListeners.forEach(callback => callback(event.data));
    }
    
    // Notify listeners on the target entity, if specified
    if (event.targetEntityId !== undefined) {
      const targetListeners = eventTypeListeners.get(event.targetEntityId);
      if (targetListeners) {
        targetListeners.forEach(callback => callback(event.data));
      }
    }
  }
  
  /**
   * Clear all entities
   */
  clear(): void {
    this.entities.clear();
    this.eventListeners.clear();
    this.nextEntityId = 1;
  }
}
