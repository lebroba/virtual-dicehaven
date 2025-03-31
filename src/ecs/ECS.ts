
import { EntityManager } from './EntityManager';
import { ComponentManager } from './ComponentManager';
import { SystemManager } from './SystemManager';
import { EntityRegistry } from './EntityRegistry';
import { EventSystem } from './EventSystem';
import { SerializationSystem } from './SerializationSystem';
import { ECSWorld } from './ECSWorld';
import { Entity, Component, System, EntityEvent, EntityQuery, SystemPerformanceMetrics } from './types';

/**
 * Main ECS class that manages entities, components, and systems
 * This is now a wrapper around the ECSWorld class for backwards compatibility
 */
export class ECS {
  private world: ECSWorld;
  
  constructor() {
    this.world = new ECSWorld();
  }
  
  /**
   * Start the ECS main loop
   */
  start(): void {
    this.world.start();
  }
  
  /**
   * Stop the ECS main loop
   */
  stop(): void {
    this.world.stop();
  }
  
  /**
   * Reset the ECS state
   */
  reset(): void {
    this.world.reset();
  }
  
  /**
   * Create a new entity
   */
  createEntity(): Entity {
    return this.world.createEntity();
  }
  
  /**
   * Remove an entity from the ECS
   */
  removeEntity(entityId: number): boolean {
    return this.world.removeEntity(entityId);
  }
  
  /**
   * Get an entity by ID
   */
  getEntity(entityId: number): Entity | undefined {
    return this.world.getEntity(entityId);
  }
  
  /**
   * Add a component to an entity
   */
  addComponent(entityId: number, component: Component): boolean {
    return this.world.addComponent(entityId, component);
  }
  
  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: number, componentType: string): boolean {
    return this.world.removeComponent(entityId, componentType);
  }
  
  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(entityId: number, componentType: string): T | undefined {
    return this.world.getComponent<T>(entityId, componentType);
  }
  
  /**
   * Check if an entity has a component
   */
  hasComponent(entityId: number, componentType: string): boolean {
    return this.world.hasComponent(entityId, componentType);
  }
  
  /**
   * Add a system to the ECS
   */
  addSystem(system: System): void {
    this.world.addSystem(system);
  }
  
  /**
   * Remove a system from the ECS
   */
  removeSystem(systemName: string): boolean {
    return this.world.removeSystem(systemName);
  }
  
  /**
   * Get a system by name
   */
  getSystem(systemName: string): System | undefined {
    return this.world.getSystem(systemName);
  }
  
  /**
   * Enable or disable a system
   */
  setSystemEnabled(systemName: string, enabled: boolean): boolean {
    return this.world.setSystemEnabled(systemName, enabled);
  }
  
  /**
   * Enable a system
   */
  enableSystem(systemName: string): boolean {
    return this.setSystemEnabled(systemName, true);
  }
  
  /**
   * Disable a system
   */
  disableSystem(systemName: string): boolean {
    return this.setSystemEnabled(systemName, false);
  }
  
  /**
   * Query entities based on criteria
   */
  queryEntities(query: EntityQuery): Entity[] {
    return this.world.queryEntities(query);
  }
  
  /**
   * Add an event listener
   */
  addEventListener(eventType: string, callback: (event: EntityEvent) => void): number {
    return this.world.addEventListener(eventType, callback);
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(eventType: string, listenerId: number): boolean {
    return this.world.removeEventListener(eventType, listenerId);
  }
  
  /**
   * Dispatch an event
   */
  dispatchEvent(event: EntityEvent): void {
    this.world.dispatchEvent(event);
  }
  
  /**
   * Send an event from one entity to another
   */
  sendEvent(
    eventType: string,
    sourceEntityId: number,
    targetEntityId: number,
    data: any = {}
  ): void {
    this.world.sendEvent(eventType, sourceEntityId, targetEntityId, data);
  }
  
  /**
   * Broadcast an event from an entity to all entities
   */
  broadcastEvent(
    eventType: string,
    sourceEntityId: number,
    data: any = {}
  ): void {
    this.world.broadcastEvent(eventType, sourceEntityId, data);
  }
  
  /**
   * Get performance metrics for all systems or a specific system
   */
  getAllSystemPerformanceMetrics(): SystemPerformanceMetrics[] {
    return this.world.getAllSystemPerformanceMetrics();
  }
  
  /**
   * Get the entity registry
   */
  getEntityRegistry(): EntityRegistry {
    return this.world.entityRegistry;
  }
  
  /**
   * Get the entity manager
   */
  getEntityManager(): EntityManager {
    // For backwards compatibility
    return new EntityManager();
  }
  
  /**
   * Get the component manager
   */
  getComponentManager(): ComponentManager {
    return this.world.componentManager;
  }
  
  /**
   * Get the system manager
   */
  getSystemManager(): SystemManager {
    return this.world.systemManager;
  }
  
  /**
   * Get the event system
   */
  getEventSystem(): EventSystem {
    return this.world.eventSystem;
  }
  
  /**
   * Get the serialization system
   */
  getSerializationSystem(): SerializationSystem {
    return this.world.serializationSystem;
  }
  
  /**
   * Set an entity's active state
   */
  setEntityActive(entityId: number, active: boolean): void {
    this.world.setEntityActive(entityId, active);
  }
  
  /**
   * Add a tag to an entity
   */
  addTag(entityId: number, tag: string): void {
    this.world.addTag(entityId, tag);
  }
  
  /**
   * Remove a tag from an entity
   */
  removeTag(entityId: number, tag: string): void {
    this.world.removeTag(entityId, tag);
  }
  
  /**
   * Check if an entity has a specific tag
   */
  hasTag(entityId: number, tag: string): boolean {
    return this.world.hasTag(entityId, tag);
  }
  
  /**
   * Save the current state to local storage
   */
  saveState(key: string = 'ecs-state'): void {
    this.world.saveState(key);
  }
  
  /**
   * Load state from local storage
   */
  loadState(key: string = 'ecs-state'): Entity[] {
    return this.world.loadState(key);
  }
  
  /**
   * Export the current state to JSON
   */
  exportToJSON(): string {
    return this.world.exportToJSON();
  }
  
  /**
   * Import state from JSON
   */
  importFromJSON(json: string): Entity[] {
    return this.world.importFromJSON(json);
  }
  
  /**
   * Trigger an event for entity component changes
   */
  triggerEvent(event: EntityEvent): void {
    this.world.dispatchEvent(event);
  }
}

// Create a singleton instance
export const ecs = new ECS();
