
import { Component, ComponentType, EntityId, LODLevel, SystemPriority } from './types';
import { EntityRegistry } from './EntityRegistry';

export class ComponentManager {
  private entityRegistry: EntityRegistry;
  private componentTypeRegistry: Set<ComponentType> = new Set();
  
  constructor(entityRegistry: EntityRegistry) {
    this.entityRegistry = entityRegistry;
  }
  
  /**
   * Register a component type in the system
   */
  registerComponentType(componentType: ComponentType): void {
    this.componentTypeRegistry.add(componentType);
  }
  
  /**
   * Check if a component type is registered
   */
  isComponentTypeRegistered(componentType: ComponentType): boolean {
    return this.componentTypeRegistry.has(componentType);
  }
  
  /**
   * Get all registered component types
   */
  getRegisteredComponentTypes(): ComponentType[] {
    return Array.from(this.componentTypeRegistry);
  }
  
  /**
   * Add a component to an entity
   */
  addComponent(
    entityId: EntityId, 
    component: Component
  ): boolean {
    const entity = this.entityRegistry.getEntity(entityId);
    
    if (!entity) {
      console.error(`Cannot add component: Entity ${entityId} not found`);
      return false;
    }
    
    if (!this.isComponentTypeRegistered(component.type)) {
      console.warn(`Component type ${component.type} is not registered`);
      this.registerComponentType(component.type);
    }
    
    // Ensure the component has the correct entityId
    component.entityId = entityId;
    
    // Add the component to the entity
    entity.components.set(component.type, component);
    return true;
  }
  
  /**
   * Create and add a component to an entity
   */
  createComponent(
    entityId: EntityId,
    type: ComponentType,
    data: any = {},
    priority: SystemPriority = 'medium',
    lodLevel: LODLevel = 'medium'
  ): Component | null {
    const entity = this.entityRegistry.getEntity(entityId);
    
    if (!entity) {
      console.error(`Cannot create component: Entity ${entityId} not found`);
      return null;
    }
    
    // Register component type if not already registered
    if (!this.isComponentTypeRegistered(type)) {
      this.registerComponentType(type);
    }
    
    // Create component
    const component: Component = {
      type,
      entityId,
      priority,
      lodLevel,
      enabled: true,
      ...data
    };
    
    // Add to entity
    entity.components.set(type, component);
    return component;
  }
  
  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entity = this.entityRegistry.getEntity(entityId);
    
    if (!entity) {
      console.error(`Cannot remove component: Entity ${entityId} not found`);
      return false;
    }
    
    return entity.components.delete(componentType);
  }
  
  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(entityId: EntityId, componentType: ComponentType): T | undefined {
    const entity = this.entityRegistry.getEntity(entityId);
    
    if (!entity) {
      return undefined;
    }
    
    return entity.components.get(componentType) as T | undefined;
  }
  
  /**
   * Check if an entity has a specific component
   */
  hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entity = this.entityRegistry.getEntity(entityId);
    
    if (!entity) {
      return false;
    }
    
    return entity.components.has(componentType);
  }
  
  /**
   * Update component LOD level
   */
  setComponentLOD(entityId: EntityId, componentType: ComponentType, lodLevel: LODLevel): boolean {
    const component = this.getComponent(entityId, componentType);
    
    if (!component) {
      return false;
    }
    
    component.lodLevel = lodLevel;
    return true;
  }
  
  /**
   * Enable or disable a component
   */
  setComponentEnabled(entityId: EntityId, componentType: ComponentType, enabled: boolean): boolean {
    const component = this.getComponent(entityId, componentType);
    
    if (!component) {
      return false;
    }
    
    component.enabled = enabled;
    return true;
  }
  
  /**
   * Get all components of a specific type across all entities
   */
  getAllComponentsOfType<T extends Component>(componentType: ComponentType): T[] {
    const components: T[] = [];
    
    for (const entity of this.entityRegistry.getAllEntities()) {
      const component = entity.components.get(componentType) as T | undefined;
      if (component && component.enabled) {
        components.push(component);
      }
    }
    
    return components;
  }
}
