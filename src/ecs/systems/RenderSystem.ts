
import { System } from '../types';
import { PositionComponent, RenderableComponent, RotationComponent, ScaleComponent } from '../types';

/**
 * RenderSystem handles rendering entities on the game board
 */
export function createRenderSystem(renderer: any): System {
  return {
    name: 'render',
    priority: 'high',
    enabled: true,
    execute: (deltaTime, entities) => {
      // Find entities with renderable components
      const renderableEntities = entities.filter(entity => {
        return entity.active && 
               entity.components.has('renderable') && 
               entity.components.has('position');
      });
      
      // Sort entities by z-index for proper layering
      renderableEntities.sort((a, b) => {
        const renderableA = a.components.get('renderable') as RenderableComponent;
        const renderableB = b.components.get('renderable') as RenderableComponent;
        return renderableA.zIndex - renderableB.zIndex;
      });
      
      // Render each entity
      renderableEntities.forEach(entity => {
        const renderable = entity.components.get('renderable') as RenderableComponent;
        const position = entity.components.get('position') as PositionComponent;
        
        // Skip if components are disabled or entity is invisible
        if (renderable.enabled === false || position.enabled === false || !renderable.visible) {
          return;
        }
        
        // Get optional rotation and scale if available
        const rotation = entity.components.get('rotation') as RotationComponent | undefined;
        const scale = entity.components.get('scale') as ScaleComponent | undefined;
        
        // Use renderer to draw the entity
        if (renderer && typeof renderer.renderEntity === 'function') {
          renderer.renderEntity(
            entity.id,
            position,
            renderable,
            rotation,
            scale
          );
        }
      });
    }
  };
}
