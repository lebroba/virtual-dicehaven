
import { System, Entity, SystemPriority, SystemPerformanceMetrics } from './types';

/**
 * Manages all systems in the ECS architecture
 */
export class SystemManager {
  private systems: Map<string, System> = new Map();
  private executionOrder: string[] = [];
  private performanceMetrics: Map<string, SystemPerformanceMetrics> = new Map();
  private isRunning: boolean = false;
  
  /**
   * Add a system to the manager
   * @param system The system to add
   * @returns True if system was added, false if a system with the same name already exists
   */
  addSystem(system: System): boolean {
    if (this.systems.has(system.name)) {
      console.warn(`System with name "${system.name}" already exists.`);
      return false;
    }
    
    this.systems.set(system.name, system);
    
    // Initialize performance metrics
    this.performanceMetrics.set(system.name, {
      systemName: system.name,
      executionTime: 0,
      entitiesProcessed: 0,
      lastExecutionTimestamp: 0,
      averageExecutionTime: 0
    });
    
    // Update execution order
    this.recalculateExecutionOrder();
    
    return true;
  }
  
  /**
   * Remove a system by name
   * @param systemName The name of the system to remove
   * @returns True if system was removed, false if not found
   */
  removeSystem(systemName: string): boolean {
    const result = this.systems.delete(systemName);
    if (result) {
      this.performanceMetrics.delete(systemName);
      this.recalculateExecutionOrder();
    }
    return result;
  }
  
  /**
   * Get a system by name
   * @param systemName The name of the system to get
   * @returns The system, or null if not found
   */
  getSystem(systemName: string): System | null {
    return this.systems.get(systemName) || null;
  }
  
  /**
   * Set a system's enabled state
   * @param systemName The name of the system
   * @param enabled The enabled state
   * @returns The updated system, or null if not found
   */
  setSystemEnabled(systemName: string, enabled: boolean): System | null {
    const system = this.systems.get(systemName);
    if (!system) return null;
    
    system.enabled = enabled;
    return system;
  }
  
  /**
   * Get the performance metrics for a system
   * @param systemName The name of the system
   * @returns The system's performance metrics, or null if not found
   */
  getSystemPerformanceMetrics(systemName: string): SystemPerformanceMetrics | null {
    return this.performanceMetrics.get(systemName) || null;
  }
  
  /**
   * Get all system performance metrics
   * @returns Array of performance metrics for all systems
   */
  getAllSystemPerformanceMetrics(): SystemPerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values());
  }
  
  /**
   * Update all enabled systems
   * @param deltaTime Time elapsed since last update (in seconds)
   * @param entities Entities to process
   */
  update(deltaTime: number, entities: Entity[]): void {
    if (!this.isRunning) return;
    
    // Run before update hooks
    this.executionOrder.forEach(systemName => {
      const system = this.systems.get(systemName);
      if (system && system.enabled && system.executeBeforeUpdate) {
        system.executeBeforeUpdate();
      }
    });
    
    // Execute systems in order
    this.executionOrder.forEach(systemName => {
      const system = this.systems.get(systemName);
      if (!system || !system.enabled) return;
      
      const startTime = performance.now();
      
      // Execute the system
      system.execute(deltaTime, entities);
      
      // Update performance metrics
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      const metrics = this.performanceMetrics.get(systemName)!;
      metrics.executionTime = executionTime;
      metrics.entitiesProcessed = entities.length;
      metrics.lastExecutionTimestamp = Date.now();
      
      // Update average execution time (simple moving average)
      if (metrics.averageExecutionTime === 0) {
        metrics.averageExecutionTime = executionTime;
      } else {
        metrics.averageExecutionTime = 0.95 * metrics.averageExecutionTime + 0.05 * executionTime;
      }
    });
    
    // Run after update hooks
    this.executionOrder.forEach(systemName => {
      const system = this.systems.get(systemName);
      if (system && system.enabled && system.executeAfterUpdate) {
        system.executeAfterUpdate();
      }
    });
  }
  
  /**
   * Start the system manager
   */
  start(): void {
    this.isRunning = true;
  }
  
  /**
   * Stop the system manager
   */
  stop(): void {
    this.isRunning = false;
  }
  
  /**
   * Check if the system manager is running
   * @returns True if running, false otherwise
   */
  isSystemManagerRunning(): boolean {
    return this.isRunning;
  }
  
  /**
   * Recalculate the execution order of systems based on priority and dependencies
   * Uses topological sorting to handle dependencies
   */
  private recalculateExecutionOrder(): void {
    // Create priority groups
    const priorityGroups: Map<SystemPriority, string[]> = new Map([
      ['high', []],
      ['medium', []],
      ['low', []]
    ]);
    
    // Group systems by priority
    this.systems.forEach((system, name) => {
      priorityGroups.get(system.priority)?.push(name);
    });
    
    // Helper function to check if a system depends on another
    const dependsOn = (systemA: string, systemB: string): boolean => {
      const systemAObj = this.systems.get(systemA);
      if (!systemAObj || !systemAObj.dependencies) return false;
      return systemAObj.dependencies.includes(systemB);
    };
    
    // Process each priority group using topological sort
    const result: string[] = [];
    const processed: Set<string> = new Set();
    
    // Process systems in priority order (high -> medium -> low)
    const processPriorityGroup = (systemNames: string[]) => {
      // Create a visited set for cycle detection
      const visited = new Set<string>();
      const temporaryMarked = new Set<string>();
      
      const visit = (name: string) => {
        // Check for cycles
        if (temporaryMarked.has(name)) {
          console.error(`Circular dependency detected in systems involving "${name}"`);
          return;
        }
        
        // Skip if already processed
        if (processed.has(name)) return;
        
        temporaryMarked.add(name);
        
        // Process dependencies first
        const system = this.systems.get(name);
        if (system && system.dependencies) {
          for (const dep of system.dependencies) {
            if (this.systems.has(dep) && !processed.has(dep)) {
              visit(dep);
            }
          }
        }
        
        // Remove temporary mark and add to result
        temporaryMarked.delete(name);
        processed.add(name);
        result.push(name);
      };
      
      // Process each system in the priority group
      for (const name of systemNames) {
        if (!processed.has(name)) {
          visit(name);
        }
      }
    };
    
    // Process priority groups in order
    processPriorityGroup(priorityGroups.get('high') || []);
    processPriorityGroup(priorityGroups.get('medium') || []);
    processPriorityGroup(priorityGroups.get('low') || []);
    
    this.executionOrder = result;
  }
}
