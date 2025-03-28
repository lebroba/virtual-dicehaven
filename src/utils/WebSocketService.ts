/**
 * Types for WebSocket messages and events
 */
export type WebSocketMessage = string | Record<string, unknown>;

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'closed' | 'reconnecting';

export interface ConnectionChangeEvent {
  status: ConnectionStatus;
  code?: number;
  reason?: string;
  permanent?: boolean;
  message?: string;
  attempt?: number;
  maxAttempts?: number;
  delay?: number;
}

export interface MessageEvent {
  [key: string]: unknown;
}

export interface ErrorEvent {
  type?: string;
  error?: Error | unknown;
  rawData?: string;
  message?: string;
}

export type WebSocketEventData = ConnectionChangeEvent | MessageEvent | ErrorEvent | unknown;

/**
 * WebSocketService - Handles WebSocket communication with the server
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private listeners: Map<string, ((data: WebSocketEventData) => void)[]> = new Map();

  /**
   * Constructor
   * @param url WebSocket URL (defaults to ws://localhost:8080)
   */
  constructor(url: string = 'ws://localhost:8080') {
    this.url = url;
  }

  /**
   * Connect to the WebSocket server
   * @returns Promise that resolves when connected or rejects on error
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          this.emit('connectionChange', { status: 'connected' });
          resolve();
        };

        this.socket.onclose = (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          this.emit('connectionChange', { status: 'disconnected', code: event.code, reason: event.reason });
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            this.emit('message', data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            this.emit('error', { type: 'parseError', error, rawData: event.data });
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.emit('error', error);
        reject(error);
      }
    });
  }

  /**
   * Send a message to the server
   * @param message Message to send (will be JSON stringified)
   * @returns Promise that resolves when sent or rejects on error
   */
  public send(message: WebSocketMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        const error = new Error('WebSocket is not connected');
        this.emit('error', error);
        reject(error);
        return;
      }

      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        this.socket.send(messageString);
        resolve();
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.emit('error', error);
        reject(error);
      }
    });
  }

  /**
   * Close the WebSocket connection
   * @param code Close code
   * @param reason Close reason
   */
  public close(code?: number, reason?: string): void {
    if (this.socket) {
      this.socket.close(code, reason);
      this.socket = null;
    }

    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Check if the WebSocket is connected
   * @returns True if connected, false otherwise
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get the current connection status
   * @returns Connection status string: 'connected', 'connecting', 'disconnected', or 'closed'
   */
  public getConnectionStatus(): string {
    if (!this.socket) return 'closed';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
      default:
        return 'disconnected';
    }
  }

  /**
   * Add an event listener
   * @param event Event name
   * @param callback Callback function
   */
  public on(event: string, callback: (data: WebSocketEventData) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param callback Callback function
   */
  public off(event: string, callback: (data: WebSocketEventData) => void): void {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all listeners
   * @param event Event name
   * @param data Event data
   */
  private emit(event: string, data: WebSocketEventData): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   * Uses exponential backoff strategy
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached`);
      this.emit('connectionChange', { 
        status: 'disconnected', 
        permanent: true, 
        message: `Failed to reconnect after ${this.maxReconnectAttempts} attempts` 
      });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.emit('connectionChange', { 
      status: 'reconnecting', 
      attempt: this.reconnectAttempts + 1, 
      maxAttempts: this.maxReconnectAttempts,
      delay 
    });

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // Error handling is done in the connect method
      });
    }, delay);
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;