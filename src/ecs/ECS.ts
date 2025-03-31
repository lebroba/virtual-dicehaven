
import { EntityManager } from './EntityManager';
import { SystemManager } from './SystemManager';
import { Entity, System, EntityId, Component, ComponentType, EntityQuery, EntityEvent, SystemPerformanceMetrics } from './types';

/**
 * Main ECS class that combines EntityManager and SystemManager
 */
export class ECS {
  private entityManager: EntityManager;
  private systemManager: SystemManager;
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  
  constructor() {
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager();
  }
  
  // Entity Management Methods
  
  createEntity(): Entity {
    return this.entityManager.createEntity();
  }
  
  addComponent(entityId: EntityId, component: Component): Entity | null {
    return this.entityManager.addComponent(entityId, component);
  }
  
  removeComponent(entityId: EntityId, componentType: ComponentType): boolean {
    return this.entityManager.removeComponent(entityId, componentType);
  }
  
  getComponent<T extends Component>(entityId: EntityId, componentType: ComponentType): T | null {
    return this.entityManager.getComponent<T>(entityId, componentType);
  }
  
  hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    return this.entityManager.hasComponent(entityId, componentType);
  }
  
  getEntity(entityId: EntityId): Entity | null {
    return this.entityManager.getEntity(entityId);
  }
  
  removeEntity(entityId: EntityId): boolean {
    return this.entityManager.removeEntity(entityId);
  }
  
  setEntityActive(entityId: EntityId, active: boolean): Entity | null {
    return this.entityManager.setEntityActive(entityId, active);
  }
  
  addTag(entityId: EntityId, tag: string): Entity | null {
    return this.entityManager.addTag(entityId, tag);
  }
  
  removeTag(entityId: EntityId, tag: string): boolean {
    return this.entityManager.removeTag(entityId, tag);
  }
  
  hasTag(entityId: EntityId, tag: string): boolean {
    return this.entityManager.hasTag(entityId, tag);
  }
  
  queryEntities(query: EntityQuery): Entity[] {
    return this.entityManager.queryEntities(query);
  }
  
  getAllEntities(): Entity[] {
    return this.entityManager.getAllEntities();
  }
  
  addEventListener(entityId: EntityId, eventType: string, callback: (data: any) => void): void {
    this.entityManager.addEventListener(entityId, eventType, callback);
  }
  
  removeEventListener(entityId: EntityId, eventType: string, callback: (data: any) => void): boolean {
    return this.entityManager.removeEventListener(entityId, eventType, callback);
  }
  
  triggerEvent(event: EntityEvent): void {
    this.entityManager.triggerEvent(event);
  }
  
  // System Management Methods
  
  addSystem(system: System): boolean {
    return this.systemManager.addSystem(system);
  }
  
  removeSystem(systemName: string): boolean {
    return this.systemManager.removeSystem(systemName);
  }
  
  getSystem(systemName: string): System | null {
    return this.systemManager.getSystem(systemName);
  }
  
  setSystemEnabled(systemName: string, enabled: boolean): System | null {
    return this.systemManager.setSystemEnabled(systemName, enabled);
  }
  
  getSystemPerformanceMetrics(systemName: string): SystemPerformanceMetrics | null {
    return this.systemManager.getSystemPerformanceMetrics(systemName);
  }
  
  getAllSystemPerformanceMetrics(): SystemPerformanceMetrics[] {
    return this.systemManager.getAllSystemPerformanceMetrics();
  }
  
  // ECS Runtime Methods
  
  /**
   * Start the ECS system
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.systemManager.start();
    this.lastUpdateTime = performance.now();
    this.update();
  }
  
  /**
   * Stop the ECS system
   */
  stop(): void {
    this.isRunning = false;
    this.systemManager.stop();
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Update the ECS system (called each frame)
   */
  private update = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;
    
    // Update systems with entities
    const entities = this.entityManager.getAllEntities();
    this.systemManager.update(deltaTime, entities);
    
    // Schedule next update
    this.animationFrameId = requestAnimationFrame(this.update);
  }
  
  /**
   * Reset the entire ECS system
   */
  reset(): void {
    this.stop();
    this.entityManager.clear();
  }
}

// Create and export a singleton instance
export const ecs = new ECS();
