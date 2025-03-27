
import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';

interface PixiRendererProps {
  width: number;
  height: number;
  className?: string;
}

const PixiRenderer: React.FC<PixiRendererProps> = ({ width, height, className }) => {
  const pixiContainer = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<PIXI.Application | null>(null);

  // Initialize PIXI application
  useEffect(() => {
    if (!pixiContainer.current) return;

    // Create the PIXI application
    const pixiApp = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Add the canvas to the DOM
    pixiContainer.current.appendChild(pixiApp.view as HTMLCanvasElement);
    setApp(pixiApp);

    // Cleanup function
    return () => {
      pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
      setApp(null);
    };
  }, [width, height]);

  // Add a sample missile path animation
  useEffect(() => {
    if (!app) return;

    // Create a container for missile paths
    const missilePathsContainer = new PIXI.Container();
    app.stage.addChild(missilePathsContainer);

    // Sample missile path
    const drawMissilePath = () => {
      const graphics = new PIXI.Graphics();
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.moveTo(100, height - 50);
      
      // Draw a parabolic arc
      const controlPointX = width / 2;
      const controlPointY = 50;
      const endX = width - 100;
      const endY = height - 150;
      
      // Create a curved line representing a missile path
      for (let t = 0; t <= 1; t += 0.01) {
        const x = (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * controlPointX + t * t * endX;
        const y = (1 - t) * (1 - t) * (height - 50) + 2 * (1 - t) * t * controlPointY + t * t * endY;
        graphics.lineTo(x, y);
      }
      
      missilePathsContainer.addChild(graphics);
      
      // Add a missile (red circle) that follows the path
      const missile = new PIXI.Graphics();
      missile.beginFill(0xff0000);
      missile.drawCircle(0, 0, 5);
      missile.endFill();
      missile.x = 100;
      missile.y = height - 50;
      missilePathsContainer.addChild(missile);
      
      // Animate the missile along the path
      let progress = 0;
      const animateMissile = () => {
        progress += 0.005;
        if (progress > 1) {
          progress = 0;
          missile.x = 100;
          missile.y = height - 50;
        } else {
          missile.x = (1 - progress) * (1 - progress) * 100 + 
                      2 * (1 - progress) * progress * controlPointX + 
                      progress * progress * endX;
          missile.y = (1 - progress) * (1 - progress) * (height - 50) + 
                      2 * (1 - progress) * progress * controlPointY + 
                      progress * progress * endY;
        }
      };
      
      app.ticker.add(animateMissile);
    };

    drawMissilePath();

    // Cleanup
    return () => {
      app.stage.removeChild(missilePathsContainer);
      missilePathsContainer.destroy({ children: true });
    };
  }, [app, height, width]);

  return <div ref={pixiContainer} className={className} />;
};

export default PixiRenderer;
