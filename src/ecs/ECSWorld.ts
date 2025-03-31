import { EntityRegistry } from './EntityRegistry';
import { ComponentManager } from './ComponentManager';
import { SystemManager } from './SystemManager';
import { EventSystem } from './EventSystem';
import { SerializationSystem } from './SerializationSystem';
import { Entity, Component, System, EntityEvent, EntityQuery, SystemPerformanceMetrics, LODLevel, EntityId } from './types';

/**
 * Main ECS World class that ties all the ECS systems together
 */
export class ECSWorld {
  readonly entityRegistry: EntityRegistry;
  readonly componentManager: ComponentManager;
  readonly systemManager: SystemManager;
  readonly eventSystem: EventSystem;
  readonly serializationSystem: SerializationSystem;
  
  private currentLODLevel: LODLevel = 'medium';
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;
  
  constructor() {
    // Initialize all systems
    this.entityRegistry = new EntityRegistry();
    this.componentManager = new ComponentManager(this.entityRegistry);
    this.systemManager = new SystemManager(this.entityRegistry);
    this.eventSystem = new EventSystem();
    this.serializationSystem = new SerializationSystem(
      this.entityRegistry,
      this.componentManager
    );
    
    this.lastUpdateTime = performance.now();
  }
  
  /**
   * Update the ECS world
   */
  update(): void {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;
    
    this.systemManager.update(deltaTime);
  }
  
  /**
   * Start the ECS world
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.updateLoop();
  }
  
  /**
   * Stop the ECS world
   */
  stop(): void {
    this.isRunning = false;
  }
  
  /**
   * Main update loop - called each frame
   */
  private updateLoop(): void {
    if (!this.isRunning) return;
    
    this.update();
    
    // Schedule next frame
    requestAnimationFrame(() => this.updateLoop());
  }
  
  /**
   * Reset the ECS world
   */
  reset(): void {
    this.stop();
    
    // Recreate all systems
    this.entityRegistry.clear();
    this.componentManager.clear();
    this.systemManager.clear();
    this.eventSystem.clearAllListeners();
    
    this.lastUpdateTime = performance.now();
  }
  
  /**
   * Create a new entity
   */
  createEntity(): Entity {
    return this.entityRegistry.createEntity();
  }
  
  /**
   * Remove an entity
   */
  removeEntity(entityId: EntityId): boolean {
    return this.entityRegistry.removeEntity(entityId);
  }
  
  /**
   * Get an entity by ID
   */
  getEntity(entityId: EntityId): Entity | undefined {
    return this.entityRegistry.getEntity(entityId);
  }
  
  /**
   * Add a component to an entity
   */
  addComponent(entityId: EntityId, component: Component): boolean {
    return this.componentManager.addComponent(entityId, component);
  }
  
  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, componentType: string): boolean {
    return this.componentManager.removeComponent(entityId, componentType);
  }
  
  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(entityId: EntityId, componentType: string): T | undefined {
    return this.componentManager.getComponent<T>(entityId, componentType);
  }
  
  /**
   * Check if an entity has a component
   */
  hasComponent(entityId: EntityId, componentType: string): boolean {
    return this.componentManager.hasComponent(entityId, componentType);
  }
  
  /**
   * Add a system
   */
  addSystem(system: System): void {
    this.systemManager.registerSystem(system);
  }
  
  /**
   * Remove a system
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
    sourceEntityId: EntityId,
    targetEntityId: EntityId,
    data: any = {}
  ): void {
    this.eventSystem.sendEvent(eventType, sourceEntityId, targetEntityId, data);
  }
  
  /**
   * Broadcast an event from an entity to all entities
   */
  broadcastEvent(
    eventType: string,
    sourceEntityId: EntityId,
    data: any = {}
  ): void {
    this.eventSystem.broadcastEvent(eventType, sourceEntityId, data);
  }
  
  /**
   * Get performance metrics for all systems
   */
  getAllSystemPerformanceMetrics(): SystemPerformanceMetrics[] {
    return this.systemManager.getPerformanceMetrics();
  }
  
  /**
   * Set an entity's active state
   */
  setEntityActive(entityId: EntityId, active: boolean): void {
    this.entityRegistry.setEntityActive(entityId, active);
  }
  
  /**
   * Add a tag to an entity
   */
  addTag(entityId: EntityId, tag: string): void {
    this.entityRegistry.addTag(entityId, tag);
  }
  
  /**
   * Remove a tag from an entity
   */
  removeTag(entityId: EntityId, tag: string): void {
    this.entityRegistry.removeTag(entityId, tag);
  }
  
  /**
   * Check if an entity has a specific tag
   */
  hasTag(entityId: EntityId, tag: string): boolean {
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
   * Set the current LOD level
   */
  setLODLevel(level: LODLevel): void {
    this.currentLODLevel = level;
  }
  
  /**
   * Get the current LOD level
   */
  getLODLevel(): LODLevel {
    return this.currentLODLevel;
  }
}

// Create a singleton instance
export const world = new ECSWorld();
