
import { EntityManager } from './EntityManager';
import { ComponentManager } from './ComponentManager';
import { SystemManager } from './SystemManager';
import { EntityRegistry } from './EntityRegistry';
import { EventSystem } from './EventSystem';
import { Entity, Component, System, EntityEvent, EntityQuery } from './types';

/**
 * Main ECS class that manages entities, components, and systems
 */
export class ECS {
  private entityRegistry: EntityRegistry;
  private entityManager: EntityManager;
  private componentManager: ComponentManager;
  private systemManager: SystemManager;
  private eventSystem: EventSystem;
  
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  
  constructor() {
    this.entityRegistry = new EntityRegistry();
    this.entityManager = new EntityManager(this.entityRegistry);
    this.componentManager = new ComponentManager(this.entityRegistry);
    this.systemManager = new SystemManager(this.entityRegistry);
    this.eventSystem = new EventSystem();
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
   * Create a new entity
   */
  createEntity(): Entity {
    return this.entityManager.createEntity();
  }
  
  /**
   * Remove an entity from the ECS
   */
  removeEntity(entityId: number): boolean {
    return this.entityManager.removeEntity(entityId);
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
  getComponent(entityId: number, componentType: string): Component | undefined {
    return this.componentManager.getComponent(entityId, componentType);
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
}

// Create a singleton instance
export const ecs = new ECS();
