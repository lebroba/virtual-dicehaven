
import { EntityManager } from './EntityManager';
import { ComponentManager } from './ComponentManager';
import { SystemManager } from './SystemManager';
import { EntityRegistry } from './EntityRegistry';
import { EventSystem } from './EventSystem';
import { SerializationSystem } from './SerializationSystem';
import { Entity, Component, System, EntityEvent, EntityQuery, SystemPerformanceMetrics } from './types';

/**
 * Main ECS class that manages entities, components, and systems
 */
export class ECS {
  private entityRegistry: EntityRegistry;
  private entityManager: EntityManager;
  private componentManager: ComponentManager;
  private systemManager: SystemManager;
  private eventSystem: EventSystem;
  private serializationSystem: SerializationSystem;
  
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  
  constructor() {
    this.entityRegistry = new EntityRegistry();
    this.entityManager = new EntityManager();
    this.componentManager = new ComponentManager(this.entityRegistry);
    this.systemManager = new SystemManager(this.entityRegistry);
    this.eventSystem = new EventSystem();
    this.serializationSystem = new SerializationSystem(this.entityRegistry, this.componentManager);
  }
  
  /**
   * Start the ECS main loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.update();
  }
  
  /**
   * Stop the ECS main loop
   */
  stop(): void {
    this.isRunning = false;
  }
  
  /**
   * Main update loop - called each frame
   */
  private update(): void {
    if (!this.isRunning) return;
    
    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = now;
    
    // Update all systems
    this.systemManager.update(deltaTime);
    
    // Schedule next frame
    requestAnimationFrame(() => this.update());
  }
  
  /**
   * Reset the ECS state
   */
  reset(): void {
    this.stop();
    this.entityRegistry = new EntityRegistry();
    this.entityManager = new EntityManager();
    this.componentManager = new ComponentManager(this.entityRegistry);
    this.systemManager = new SystemManager(this.entityRegistry);
    this.eventSystem = new EventSystem();
    this.serializationSystem = new SerializationSystem(this.entityRegistry, this.componentManager);
  }
  
  /**
   * Create a new entity
   */
  createEntity(): Entity {
    return this.entityRegistry.createEntity();
  }
  
  /**
   * Remove an entity from the ECS
   */
  removeEntity(entityId: number): boolean {
    return this.entityRegistry.removeEntity(entityId);
  }
  
  /**
   * Get an entity by ID
   */
  getEntity(entityId: number): Entity | undefined {
    return this.entityRegistry.getEntity(entityId);
  }
  
  /**
   * Add a component to an entity
   */
  addComponent(entityId: number, component: Component): boolean {
    return this.componentManager.addComponent(entityId, component);
  }
  
  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: number, componentType: string): boolean {
    return this.componentManager.removeComponent(entityId, componentType);
  }
  
  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(entityId: number, componentType: string): T | undefined {
    return this.componentManager.getComponent<T>(entityId, componentType);
  }
  
  /**
   * Check if an entity has a component
   */
  hasComponent(entityId: number, componentType: string): boolean {
    return this.componentManager.hasComponent(entityId, componentType);
  }
  
  /**
   * Add a system to the ECS
   */
  addSystem(system: System): void {
    this.systemManager.registerSystem(system);
  }
  
  /**
   * Remove a system from the ECS
   */
  removeSystem(systemName: string): boolean {
    return this.systemManager.removeSystem(systemName);
  }
  
  /**
   * Get a system by name
   */
  getSystem(systemName: string): System | undefined {
    return this.systemManager.getSystem(systemName);
  }
  
  /**
   * Enable or disable a system
   */
  setSystemEnabled(systemName: string, enabled: boolean): boolean {
    return this.systemManager.setSystemEnabled(systemName, enabled);
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
    return this.entityRegistry.queryEntities(query);
  }
  
  /**
   * Add an event listener
   */
  addEventListener(eventType: string, callback: (event: EntityEvent) => void): number {
    return this.eventSystem.addEventListener(eventType, callback);
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(eventType: string, listenerId: number): boolean {
    return this.eventSystem.removeEventListener(eventType, listenerId);
  }
  
  /**
   * Dispatch an event
   */
  dispatchEvent(event: EntityEvent): void {
    this.eventSystem.dispatchEvent(event);
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
    this.eventSystem.sendEvent(eventType, sourceEntityId, targetEntityId, data);
  }
  
  /**
   * Broadcast an event from an entity to all entities
   */
  broadcastEvent(
    eventType: string,
    sourceEntityId: number,
    data: any = {}
  ): void {
    this.eventSystem.broadcastEvent(eventType, sourceEntityId, data);
  }
  
  /**
   * Get performance metrics for all systems or a specific system
   */
  getAllSystemPerformanceMetrics(): SystemPerformanceMetrics[] {
    return this.systemManager.getPerformanceMetrics() as SystemPerformanceMetrics[];
  }
  
  /**
   * Get the entity registry
   */
  getEntityRegistry(): EntityRegistry {
    return this.entityRegistry;
  }
  
  /**
   * Get the entity manager
   */
  getEntityManager(): EntityManager {
    return this.entityManager;
  }
  
  /**
   * Get the component manager
   */
  getComponentManager(): ComponentManager {
    return this.componentManager;
  }
  
  /**
   * Get the system manager
   */
  getSystemManager(): SystemManager {
    return this.systemManager;
  }
  
  /**
   * Get the event system
   */
  getEventSystem(): EventSystem {
    return this.eventSystem;
  }
  
  /**
   * Get the serialization system
   */
  getSerializationSystem(): SerializationSystem {
    return this.serializationSystem;
  }
  
  /**
   * Set an entity's active state
   */
  setEntityActive(entityId: number, active: boolean): void {
    this.entityRegistry.setEntityActive(entityId, active);
  }
  
  /**
   * Add a tag to an entity
   */
  addTag(entityId: number, tag: string): void {
    this.entityRegistry.addTag(entityId, tag);
  }
  
  /**
   * Remove a tag from an entity
   */
  removeTag(entityId: number, tag: string): void {
    this.entityRegistry.removeTag(entityId, tag);
  }
  
  /**
   * Check if an entity has a specific tag
   */
  hasTag(entityId: number, tag: string): boolean {
    return this.entityRegistry.hasTag(entityId, tag);
  }
  
  /**
   * Save the current state to local storage
   */
  saveState(key: string = 'ecs-state'): void {
    this.serializationSystem.saveToLocalStorage(key);
  }
  
  /**
   * Load state from local storage
   */
  loadState(key: string = 'ecs-state'): Entity[] {
    return this.serializationSystem.loadFromLocalStorage(key);
  }
  
  /**
   * Export the current state to JSON
   */
  exportToJSON(): string {
    return this.serializationSystem.exportToJSON();
  }
  
  /**
   * Import state from JSON
   */
  importFromJSON(json: string): Entity[] {
    return this.serializationSystem.importFromJSON(json);
  }
  
  /**
   * Trigger an event for entity component changes
   */
  triggerEvent(event: EntityEvent): void {
    this.eventSystem.dispatchEvent(event);
  }
}

// Create a singleton instance
export const ecs = new ECS();
