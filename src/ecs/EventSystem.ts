
import { EntityEvent } from './types';

export class EventSystem {
  private listeners: Map<string, ((event: EntityEvent) => void)[]> = new Map();

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
   * @returns Unsubscribe function
   */
  addEventListener(eventType: string, callback: (event: EntityEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    const callbacks = this.listeners.get(eventType)!;
    callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Remove an event listener
   * @param eventType Type of event
   * @param callback Callback to remove
   */
  removeEventListener(eventType: string, callback: (event: EntityEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      return;
    }
    
    const callbacks = this.listeners.get(eventType)!;
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
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
  clearEventListeners(): void {
    this.listeners.clear();
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
}
