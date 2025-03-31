
import { v4 as uuidv4 } from 'uuid';

/**
 * Base class for all entities in the game
 */
export class Entity {
  readonly id: string;
  x: number;
  y: number;
  rotation: number;
  private components: Map<string, any>;
  
  constructor(x: number = 0, y: number = 0, rotation: number = 0, id?: string) {
    this.id = id || uuidv4();
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.components = new Map();
  }

  /**
   * Called when the entity is created
   */
  onCreate(): void {
    // Empty by default, can be overridden by derived classes
  }

  /**
   * Called when the entity is initialized
   */
  onInit(): void {
    // Empty by default, can be overridden by derived classes
  }

  /**
   * Called when the entity is destroyed
   */
  onDestroy(): void {
    // Empty by default, can be overridden by derived classes
  }

  /**
   * Add a component to the entity
   */
  addComponent<T>(type: string, component: T): void {
    this.components.set(type, component);
  }

  /**
   * Get a component by type
   */
  getComponent<T>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  /**
   * Check if the entity has a component
   */
  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * Remove a component by type
   */
  removeComponent(type: string): boolean {
    return this.components.delete(type);
  }

  /**
   * Update the entity's position
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Update the entity's rotation
   */
  setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  /**
   * Move the entity by a delta amount
   */
  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  /**
   * Rotate the entity by a delta amount
   */
  rotate(dr: number): void {
    this.rotation = (this.rotation + dr) % 360;
    if (this.rotation < 0) this.rotation += 360;
  }

  /**
   * Get all component types
   */
  getComponentTypes(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Get all components
   */
  getAllComponents(): Map<string, any> {
    return new Map(this.components);
  }

  /**
   * Clear all components
   */
  clearComponents(): void {
    this.components.clear();
  }
}
