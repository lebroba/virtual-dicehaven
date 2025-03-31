
import { EntityId, EntityEvent, EntityEventCallback } from './types';

export class EventSystem {
  private listeners: Map<string, Map<number, EntityEventCallback>> = new Map();
  private nextListenerId: number = 1;
  
  constructor() {}
  
  /**
   * Add an event listener
   * @returns Listener ID that can be used to remove the listener
   */
  addEventListener(eventType: string, callback: EntityEventCallback): number {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Map());
    }
    
    const eventListeners = this.listeners.get(eventType)!;
    const listenerId = this.nextListenerId++;
    
    eventListeners.set(listenerId, callback);
    return listenerId;
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(eventType: string, listenerId: number): boolean {
    const eventListeners = this.listeners.get(eventType);
    
    if (!eventListeners) {
      return false;
    }
    
    return eventListeners.delete(listenerId);
  }
  
  /**
   * Dispatch an event
   */
  dispatchEvent(event: EntityEvent): void {
    const eventListeners = this.listeners.get(event.type);
    
    if (!eventListeners) {
      return;
    }
    
    // Call all listeners
    for (const callback of eventListeners.values()) {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    }
  }
  
  /**
   * Dispatch an event from a source entity to a target entity
   */
  sendEvent(
    eventType: string,
    sourceEntityId: EntityId,
    targetEntityId: EntityId,
    data: any = {}
  ): void {
    this.dispatchEvent({
      type: eventType,
      sourceEntityId,
      targetEntityId,
      data
    });
  }
  
  /**
   * Broadcast an event from a source entity to all entities
   */
  broadcastEvent(
    eventType: string,
    sourceEntityId: EntityId,
    data: any = {}
  ): void {
    this.dispatchEvent({
      type: eventType,
      sourceEntityId,
      data
    });
  }
  
  /**
   * Check if an event type has any listeners
   */
  hasListeners(eventType: string): boolean {
    const eventListeners = this.listeners.get(eventType);
    return !!eventListeners && eventListeners.size > 0;
  }
  
  /**
   * Get the number of listeners for an event type
   */
  listenerCount(eventType: string): number {
    const eventListeners = this.listeners.get(eventType);
    return eventListeners ? eventListeners.size : 0;
  }
  
  /**
   * Remove all listeners for an event type
   */
  removeAllListeners(eventType: string): void {
    this.listeners.delete(eventType);
  }
  
  /**
   * Clear all event listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
  }
}
