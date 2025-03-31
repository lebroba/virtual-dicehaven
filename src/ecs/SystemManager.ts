
import { EntityRegistry } from './EntityRegistry';
import { Entity, System, SystemPriority } from './types';

interface SystemPerformanceMetrics {
  systemName: string;
  executionTime: number;
  entitiesProcessed: number;
  lastExecutionTimestamp: number;
  averageExecutionTime: number;
}

export class SystemManager {
  private entityRegistry: EntityRegistry;
  private systems: Map<string, System> = new Map();
  private systemExecutionOrder: string[] = [];
  private performanceMetrics: Map<string, SystemPerformanceMetrics> = new Map();

  constructor(entityRegistry: EntityRegistry) {
    this.entityRegistry = entityRegistry;
  }

  /**
   * Register a system in the ECS
   */
  registerSystem(system: System): void {
    if (this.systems.has(system.name)) {
      console.warn(`System '${system.name}' is already registered. Overwriting.`);
    }

    this.systems.set(system.name, system);
    this.updateSystemExecutionOrder();
    
    // Initialize performance metrics
    this.performanceMetrics.set(system.name, {
      systemName: system.name,
      executionTime: 0,
      entitiesProcessed: 0,
      lastExecutionTimestamp: 0,
      averageExecutionTime: 0
    });
  }

  /**
   * Remove a system from the ECS
   */
  removeSystem(systemName: string): boolean {
    const result = this.systems.delete(systemName);
    if (result) {
      this.updateSystemExecutionOrder();
      this.performanceMetrics.delete(systemName);
    }
    return result;
  }

  /**
   * Get a system by name
   */
  getSystem(systemName: string): System | undefined {
    return this.systems.get(systemName);
  }

  /**
   * Enable or disable a system
   */
  setSystemEnabled(systemName: string, enabled: boolean): boolean {
    const system = this.systems.get(systemName);
    if (!system) {
      return false;
    }
    
    system.enabled = enabled;
    return true;
  }

  /**
   * Update all systems
   */
  update(deltaTime: number): void {
    // First, execute any pre-update functions
    for (const systemName of this.systemExecutionOrder) {
      const system = this.systems.get(systemName)!;
      
      if (system.enabled && system.executeBeforeUpdate) {
        try {
          system.executeBeforeUpdate();
        } catch (error) {
          console.error(`Error in system '${systemName}' executeBeforeUpdate:`, error);
        }
      }
    }
    
    // Then execute the main update functions
    for (const systemName of this.systemExecutionOrder) {
      const system = this.systems.get(systemName)!;
      
      if (!system.enabled) {
        continue;
      }
      
      // Get entities for this system
      const entities = this.getEntitiesForSystem(system);
      
      // Performance tracking
      const startTime = performance.now();
      
      try {
        // Execute the system's update function
        system.execute(deltaTime, entities);
      } catch (error) {
        console.error(`Error in system '${systemName}' execute:`, error);
      }
      
      // Update performance metrics
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      this.updatePerformanceMetrics(system.name, executionTime, entities.length);
    }
    
    // Finally, execute any post-update functions
    for (const systemName of this.systemExecutionOrder) {
      const system = this.systems.get(systemName)!;
      
      if (system.enabled && system.executeAfterUpdate) {
        try {
          system.executeAfterUpdate();
        } catch (error) {
          console.error(`Error in system '${systemName}' executeAfterUpdate:`, error);
        }
      }
    }
  }

  /**
   * Get entities for a specific system
   */
  private getEntitiesForSystem(system: System): Entity[] {
    // For now, just return all active entities
    // This could be optimized in the future to only return entities
    // that have the components required by the system
    return this.entityRegistry.getAllEntities().filter(entity => entity.active);
  }

  /**
   * Update the system execution order based on priorities
   */
  private updateSystemExecutionOrder(): void {
    const systemNames = Array.from(this.systems.keys());
    
    // Sort systems by priority (high -> medium -> low)
    this.systemExecutionOrder = systemNames.sort((a, b) => {
      const systemA = this.systems.get(a)!;
      const systemB = this.systems.get(b)!;
      
      const priorityMapping: Record<SystemPriority, number> = {
        high: 0,
        medium: 1,
        low: 2
      };
      
      return priorityMapping[systemA.priority] - priorityMapping[systemB.priority];
    });
    
    // Consider dependencies (systems with dependencies run after the systems they depend on)
    // This is a simplified approach that may not handle all circular dependencies
    let hasChanged = true;
    while (hasChanged) {
      hasChanged = false;
      
      for (let i = 0; i < this.systemExecutionOrder.length; i++) {
        const systemName = this.systemExecutionOrder[i];
        const system = this.systems.get(systemName)!;
        
        if (system.dependencies && system.dependencies.length > 0) {
          // Find the highest index of any dependency
          let maxDependencyIndex = -1;
          
          for (const depName of system.dependencies) {
            const depIndex = this.systemExecutionOrder.indexOf(depName);
            if (depIndex !== -1 && depIndex > maxDependencyIndex) {
              maxDependencyIndex = depIndex;
            }
          }
          
          // If this system is before any of its dependencies, move it after the last dependency
          if (maxDependencyIndex !== -1 && i <= maxDependencyIndex) {
            // Remove the system
            this.systemExecutionOrder.splice(i, 1);
            // Insert it after its dependency
            this.systemExecutionOrder.splice(maxDependencyIndex, 0, systemName);
            hasChanged = true;
            break;
          }
        }
      }
    }
  }

  /**
   * Update performance metrics for a system
   */
  private updatePerformanceMetrics(
    systemName: string,
    executionTime: number,
    entitiesProcessed: number
  ): void {
    const metrics = this.performanceMetrics.get(systemName);
    
    if (!metrics) {
      return;
    }
    
    // Exponential moving average for execution time (alpha = 0.3)
    const alpha = 0.3;
    metrics.averageExecutionTime = 
      alpha * executionTime + (1 - alpha) * metrics.averageExecutionTime;
    
    metrics.executionTime = executionTime;
    metrics.entitiesProcessed = entitiesProcessed;
    metrics.lastExecutionTimestamp = performance.now();
  }

  /**
   * Get performance metrics for all systems
   */
  getPerformanceMetrics(): SystemPerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values());
  }

  /**
   * Get performance metrics for a specific system
   */
  getSystemPerformanceMetrics(systemName: string): SystemPerformanceMetrics | undefined {
    return this.performanceMetrics.get(systemName);
  }

  /**
   * Clear all systems
   */
  clear(): void {
    this.systems.clear();
    this.systemExecutionOrder = [];
    this.performanceMetrics.clear();
  }
}
