
import { System, SystemPriority, SystemPerformanceMetrics } from './types';

export class SystemManager {
  private systems: Map<string, System> = new Map();
  private systemPerformance: Map<string, SystemPerformanceMetrics> = new Map();
  
  constructor() {}
  
  /**
   * Add a system to the manager
   */
  addSystem(system: System): boolean {
    if (this.systems.has(system.name)) {
      console.warn(`System with name ${system.name} already exists`);
      return false;
    }
    
    this.systems.set(system.name, system);
    
    // Initialize performance metrics
    this.systemPerformance.set(system.name, {
      systemName: system.name,
      executionTime: 0,
      entitiesProcessed: 0,
      lastExecutionTimestamp: 0,
      averageExecutionTime: 0
    });
    
    return true;
  }
  
  /**
   * Remove a system from the manager
   */
  removeSystem(systemName: string): boolean {
    if (!this.systems.has(systemName)) {
      return false;
    }
    
    this.systems.delete(systemName);
    this.systemPerformance.delete(systemName);
    
    return true;
  }
  
  /**
   * Get a system by name
   */
  getSystem(systemName: string): System | undefined {
    return this.systems.get(systemName);
  }
  
  /**
   * Enable a system
   */
  enableSystem(systemName: string): boolean {
    const system = this.systems.get(systemName);
    if (!system) {
      return false;
    }
    
    system.enabled = true;
    return true;
  }
  
  /**
   * Disable a system
   */
  disableSystem(systemName: string): boolean {
    const system = this.systems.get(systemName);
    if (!system) {
      return false;
    }
    
    system.enabled = false;
    return true;
  }
  
  /**
   * Get all systems
   */
  getAllSystems(): System[] {
    return Array.from(this.systems.values());
  }
  
  /**
   * Get only active systems
   */
  getActiveSystems(): System[] {
    // Filter for enabled systems
    const enabledSystems = Array.from(this.systems.values())
      .filter(system => system.enabled);
    
    // Sort by priority
    return this.sortSystemsByPriorityAndDependencies(enabledSystems);
  }
  
  /**
   * Sort systems by priority and dependencies
   */
  private sortSystemsByPriorityAndDependencies(systems: System[]): System[] {
    // Create a priority map
    const priorityValues: Record<SystemPriority, number> = {
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    // Check for circular dependencies
    const systemNames = new Set(systems.map(system => system.name));
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const detectCircularDependency = (systemName: string): boolean => {
      if (!visited.has(systemName)) {
        visited.add(systemName);
        recursionStack.add(systemName);
        
        const system = this.systems.get(systemName);
        const dependencies = system?.dependencies || [];
        
        for (const dep of dependencies) {
          if (!visited.has(dep) && detectCircularDependency(dep)) {
            return true;
          } else if (recursionStack.has(dep)) {
            console.error(`Circular dependency detected: ${systemName} -> ${dep}`);
            return true;
          }
        }
      }
      
      recursionStack.delete(systemName);
      return false;
    };
    
    // Check for circular dependencies
    for (const system of systems) {
      if (detectCircularDependency(system.name)) {
        console.error('Circular dependency detected in systems, some systems may not run in the expected order');
        break;
      }
    }
    
    // Sort by priority and dependencies
    return systems.sort((a, b) => {
      // First, check if one system depends on the other
      if (a.dependencies?.includes(b.name)) return 1;
      if (b.dependencies?.includes(a.name)) return -1;
      
      // Then, sort by priority
      return priorityValues[b.priority] - priorityValues[a.priority];
    });
  }
  
  /**
   * Update performance metrics for a system
   */
  updatePerformanceMetrics(
    systemName: string,
    executionTime: number,
    entitiesProcessed: number
  ): void {
    const metrics = this.systemPerformance.get(systemName);
    if (!metrics) return;
    
    // Update current execution metrics
    metrics.executionTime = executionTime;
    metrics.entitiesProcessed = entitiesProcessed;
    metrics.lastExecutionTimestamp = Date.now();
    
    // Update average (with simple moving average)
    metrics.averageExecutionTime = (metrics.averageExecutionTime * 0.9) + (executionTime * 0.1);
  }
  
  /**
   * Get performance metrics for a system
   */
  getSystemPerformanceMetrics(systemName: string): SystemPerformanceMetrics | undefined {
    return this.systemPerformance.get(systemName);
  }
  
  /**
   * Get performance metrics for all systems
   */
  getPerformanceMetrics(): SystemPerformanceMetrics[] {
    return Array.from(this.systemPerformance.values());
  }
  
  /**
   * Clear all systems
   */
  clear(): void {
    this.systems.clear();
    this.systemPerformance.clear();
  }
}
