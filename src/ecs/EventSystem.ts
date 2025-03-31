
import { EntityEvent, EntityId } from './types';

export class EventSystem {
  private listeners: Map<string, ((event: EntityEvent) => void)[]> = new Map();
  private listenerIds: Map<string, Map<number, (event: EntityEvent) => void>> = new Map();
  private nextListenerId: number = 1;

  constructor() {
    // Initialize with common event types
    this.listeners.set('collision', []);
    this.listeners.set('damage', []);
    this.listeners.set('destroy', []);
    this.listeners.set('spawn', []);
    this.listeners.set('move', []);
  }

  /**
   * Add an event listener for a specific event type
   * @param eventType Type of event to listen for
   * @param callback Callback to execute when event is dispatched
   * @returns Listener ID that can be used to remove the listener
   */
  addEventListener(eventType: string, callback: (event: EntityEvent) => void): number {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    const callbacks = this.listeners.get(eventType)!;
    callbacks.push(callback);
    
    // Store the listener with an ID
    if (!this.listenerIds.has(eventType)) {
      this.listenerIds.set(eventType, new Map());
    }
    
    const listenerId = this.nextListenerId++;
    this.listenerIds.get(eventType)!.set(listenerId, callback);
    
    return listenerId;
  }

  /**
   * Remove an event listener by ID
   * @param eventType Type of event
   * @param listenerId ID of the listener to remove
   * @returns True if listener was removed, false otherwise
   */
  removeEventListener(eventType: string, listenerId: number): boolean {
    if (!this.listenerIds.has(eventType)) {
      return false;
    }
    
    const listeners = this.listenerIds.get(eventType)!;
    
    if (!listeners.has(listenerId)) {
      return false;
    }
    
    const callback = listeners.get(listenerId)!;
    listeners.delete(listenerId);
    
    // Also remove from callbacks array
    const callbacks = this.listeners.get(eventType)!;
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    
    return true;
  }

  /**
   * Remove an event listener by callback reference
   * @param eventType Type of event
   * @param callback Callback to remove
   */
  removeEventListenerByCallback(eventType: string, callback: (event: EntityEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      return;
    }
    
    const callbacks = this.listeners.get(eventType)!;
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    
    // Also remove from listeners map
    if (this.listenerIds.has(eventType)) {
      const listeners = this.listenerIds.get(eventType)!;
      for (const [id, cb] of listeners.entries()) {
        if (cb === callback) {
          listeners.delete(id);
          break;
        }
      }
    }
  }

  /**
   * Dispatch an event to all registered listeners
   * @param event Event to dispatch
   */
  dispatchEvent(event: EntityEvent): void {
    if (!this.listeners.has(event.type)) {
      return;
    }
    
    const callbacks = this.listeners.get(event.type)!;
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }

  /**
   * Clear all event listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
    this.listenerIds.clear();
  }

  /**
   * Get count of listeners for a specific event type
   * @param eventType Type of event
   */
  getListenerCount(eventType: string): number {
    if (!this.listeners.has(eventType)) {
      return 0;
    }
    return this.listeners.get(eventType)!.length;
  }

  /**
   * Send an event from one entity to another
   * @param eventType Type of event
   * @param sourceEntityId ID of the source entity
   * @param targetEntityId ID of the target entity
   * @param data Additional event data
   */
  sendEvent(
    eventType: string,
    sourceEntityId: EntityId,
    targetEntityId: EntityId,
    data: any = {}
  ): void {
    const event: EntityEvent = {
      type: eventType,
      sourceEntityId,
      targetEntityId,
      data,
      time: Date.now()
    };
    
    this.dispatchEvent(event);
  }

  /**
   * Broadcast an event from an entity to all entities (no specific target)
   * @param eventType Type of event
   * @param sourceEntityId ID of the source entity
   * @param data Additional event data
   */
  broadcastEvent(
    eventType: string,
    sourceEntityId: EntityId,
    data: any = {}
  ): void {
    const event: EntityEvent = {
      type: eventType,
      sourceEntityId,
      data,
      time: Date.now()
    };
    
    this.dispatchEvent(event);
  }
}
