
import { Entity, EntityId, Component, System, EntityEvent, EntityEventCallback, EntityQuery } from './types';
import { EntityRegistry } from './EntityRegistry';
import { ComponentManager } from './ComponentManager';
import { SystemManager } from './SystemManager';

export class ECS {
  private entityRegistry: EntityRegistry;
  private componentManager: ComponentManager;
  private systemManager: SystemManager;
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private frameId: number | null = null;
  
  constructor() {
    this.entityRegistry = new EntityRegistry();
    this.componentManager = new ComponentManager(this.entityRegistry);
    this.systemManager = new SystemManager();
    
    // Initialize common component types
    this.componentManager.registerComponentType('position');
    this.componentManager.registerComponentType('velocity');
    this.componentManager.registerComponentType('rotation');
    this.componentManager.registerComponentType('scale');
    this.componentManager.registerComponentType('renderable');
    this.componentManager.registerComponentType('collider');
    this.componentManager.registerComponentType('health');
    this.componentManager.registerComponentType('ship');
  }
  
  // Entity Management
  createEntity(tags: string[] = []): Entity {
    return this.entityRegistry.createEntity(tags);
  }
  
  removeEntity(entityId: EntityId): boolean {
    return this.entityRegistry.removeEntity(entityId);
  }
  
  getEntity(entityId: EntityId): Entity | undefined {
    return this.entityRegistry.getEntity(entityId);
  }
  
  setEntityActive(entityId: EntityId, active: boolean): void {
    this.entityRegistry.setEntityActive(entityId, active);
  }
  
  addTag(entityId: EntityId, tag: string): void {
    this.entityRegistry.addTag(entityId, tag);
  }
  
  removeTag(entityId: EntityId, tag: string): void {
    this.entityRegistry.removeTag(entityId, tag);
  }
  
  hasTag(entityId: EntityId, tag: string): boolean {
    return this.entityRegistry.hasTag(entityId, tag);
  }
  
  queryEntities(query: EntityQuery): Entity[] {
    return this.entityRegistry.queryEntities(query);
  }
  
  // Component Management
  addComponent(entityId: EntityId, component: Component): boolean {
    return this.componentManager.addComponent(entityId, component);
  }
  
  removeComponent(entityId: EntityId, componentType: string): boolean {
    return this.componentManager.removeComponent(entityId, componentType);
  }
  
  getComponent<T extends Component>(entityId: EntityId, componentType: string): T | undefined {
    return this.componentManager.getComponent<T>(entityId, componentType);
  }
  
  hasComponent(entityId: EntityId, componentType: string): boolean {
    return this.componentManager.hasComponent(entityId, componentType);
  }
  
  // System Management
  addSystem(system: System): boolean {
    return this.systemManager.addSystem(system);
  }
  
  removeSystem(systemName: string): boolean {
    return this.systemManager.removeSystem(systemName);
  }
  
  getSystem(systemName: string): System | undefined {
    return this.systemManager.getSystem(systemName);
  }
  
  enableSystem(systemName: string): boolean {
    return this.systemManager.enableSystem(systemName);
  }
  
  disableSystem(systemName: string): boolean {
    return this.systemManager.disableSystem(systemName);
  }
  
  // Event System
  private eventListeners: Map<string, Map<EntityId, EntityEventCallback[]>> = new Map();
  
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
  
  // System Execution
  private update(timestamp: number): void {
    if (!this.isRunning) return;
    
    const deltaTime = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0;
    this.lastFrameTime = timestamp;
    
    const allEntities = this.entityRegistry.getAllEntities();
    const activeSystems = this.systemManager.getActiveSystems();
    
    // Call beforeUpdate hooks
    for (const system of activeSystems) {
      if (system.executeBeforeUpdate) {
        system.executeBeforeUpdate();
      }
    }
    
    // Execute systems
    for (const system of activeSystems) {
      system.execute(deltaTime, allEntities);
    }
    
    // Call afterUpdate hooks
    for (const system of activeSystems) {
      if (system.executeAfterUpdate) {
        system.executeAfterUpdate();
      }
    }
    
    // Schedule next frame
    this.frameId = requestAnimationFrame(this.update.bind(this));
  }
  
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = 0;
    this.frameId = requestAnimationFrame(this.update.bind(this));
    console.log('ECS started');
  }
  
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    console.log('ECS stopped');
  }
  
  reset(): void {
    // Stop the update loop
    this.stop();
    
    // Clear all systems
    this.systemManager.clear();
    
    // Clear all entities and components
    // We'll recreate the entity registry and component manager
    this.entityRegistry = new EntityRegistry();
    this.componentManager = new ComponentManager(this.entityRegistry);
    
    // Clear event listeners
    this.eventListeners.clear();
    
    console.log('ECS reset');
  }
  
  getAllSystemPerformanceMetrics() {
    return this.systemManager.getPerformanceMetrics();
  }
}

// Export a singleton instance
export const ecs = new ECS();
