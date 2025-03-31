
import { System } from '../types';
import { PositionComponent, RenderableComponent, RotationComponent, ScaleComponent } from '../components/common';

/**
 * Interface for rendering canvas context
 */
export interface RenderingContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  clear: () => void;
  imageCache: Map<string, HTMLImageElement>;
}

/**
 * RenderSystem draws all renderable entities on a canvas
 * @param context Rendering context (canvas context, dimensions, etc.)
 * @returns Render system
 */
export function createRenderSystem(context: RenderingContext): System {
  // Cache for loaded images
  const imageCache = context.imageCache || new Map<string, HTMLImageElement>();
  
  // Helper function to get or load an image
  const getImage = (src: string): HTMLImageElement | null => {
    if (imageCache.has(src)) {
      return imageCache.get(src) || null;
    }
    
    // Start loading the image
    const img = new Image();
    img.src = src;
    
    // Store in cache even while loading
    imageCache.set(src, img);
    
    return null;
  };
  
  // Helper function to draw a rotated rectangle
  const drawRotatedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    angle: number,
    color: string,
    opacity: number
  ) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.restore();
  };
  
  // Helper function to draw a rotated circle
  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    opacity: number
  ) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };
  
  // Helper function to draw a rotated triangle
  const drawRotatedTriangle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    angle: number,
    color: string,
    opacity: number
  ) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(-width / 2, height / 2);
    ctx.lineTo(width / 2, height / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };
  
  // Helper function to draw a rotated image
  const drawRotatedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    angle: number,
    opacity: number
  ) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
  };
  
  return {
    name: 'render',
    priority: 'low', // Render after all other systems have updated
    enabled: true,
    executeBeforeUpdate: () => {
      // Clear the canvas before drawing a new frame
      if (context.clear) {
        context.clear();
      } else {
        context.ctx.clearRect(0, 0, context.width, context.height);
      }
    },
    execute: (deltaTime, entities) => {
      // Sort entities by z-index for proper layering
      const renderableEntities = entities.filter(entity => {
        return entity.active && 
               entity.components.has('position') && 
               entity.components.has('renderable');
      }).sort((a, b) => {
        const renderableA = a.components.get('renderable') as RenderableComponent;
        const renderableB = b.components.get('renderable') as RenderableComponent;
        return renderableA.zIndex - renderableB.zIndex;
      });
      
      // Render each entity
      renderableEntities.forEach(entity => {
        const position = entity.components.get('position') as PositionComponent;
        const renderable = entity.components.get('renderable') as RenderableComponent;
        
        // Skip if components are disabled or entity is not visible
        if (!position.enabled || !renderable.enabled || !renderable.visible) return;
        
        // Get rotation and scale if available
        const rotation = entity.components.get('rotation') as RotationComponent | undefined;
        const scale = entity.components.get('scale') as ScaleComponent | undefined;
        
        const angle = rotation?.enabled ? rotation.angle : 0;
        const scaleX = scale?.enabled ? scale.scaleX : 1;
        const scaleY = scale?.enabled ? scale.scaleY : 1;
        
        // Calculate dimensions
        const width = renderable.width * scaleX;
        const height = renderable.height * scaleY;
        
        // Draw the entity based on its shape
        switch (renderable.shape) {
          case 'rectangle':
            drawRotatedRect(
              context.ctx,
              position.x,
              position.y,
              width,
              height,
              angle,
              renderable.color || '#FF0000',
              renderable.opacity || 1
            );
            break;
            
          case 'circle':
            drawCircle(
              context.ctx,
              position.x,
              position.y,
              width / 2, // Use width as diameter
              renderable.color || '#FF0000',
              renderable.opacity || 1
            );
            break;
            
          case 'triangle':
            drawRotatedTriangle(
              context.ctx,
              position.x,
              position.y,
              width,
              height,
              angle,
              renderable.color || '#FF0000',
              renderable.opacity || 1
            );
            break;
            
          case 'image':
            if (renderable.imageSrc) {
              const img = getImage(renderable.imageSrc);
              if (img && img.complete) {
                drawRotatedImage(
                  context.ctx,
                  img,
                  position.x,
                  position.y,
                  width,
                  height,
                  angle,
                  renderable.opacity || 1
                );
              }
            }
            break;
        }
      });
    }
  };
}
