
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

    // Create PIXI application with explicit transparency
    const pixiApp = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0, // Make background transparent
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Ensure the canvas itself has no background
    const canvas = pixiApp.view as HTMLCanvasElement;
    canvas.style.background = 'transparent';

    // Add the canvas to the DOM
    pixiContainer.current.appendChild(canvas);
    setApp(pixiApp);

    // Make the canvas responsive
    const onResize = () => {
      if (!pixiContainer.current) return;
      const parent = pixiContainer.current;
      pixiApp.renderer.resize(parent.clientWidth, parent.clientHeight);
    };

    window.addEventListener('resize', onResize);
    onResize(); // Initial sizing

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      
      // Fix: Check for null reference before calling destroy
      if (pixiApp) {
        try {
          // Fix: Handle case where canvas might already be removed
          if (pixiContainer.current && canvas.parentNode === pixiContainer.current) {
            pixiContainer.current.removeChild(canvas);
          }
          pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch (err) {
          console.error("Error cleaning up PIXI application:", err);
        }
      }
      setApp(null);
    };
  }, [width, height]);

  // Add missile path animation
  useEffect(() => {
    if (!app) return;

    const missilePathsContainer = new PIXI.Container();
    app.stage.addChild(missilePathsContainer);

    const drawMissilePath = () => {
      const graphics = new PIXI.Graphics();
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.moveTo(100, height - 50);

      const controlPointX = width / 2;
      const controlPointY = 50;
      const endX = width - 100;
      const endY = height - 150;

      for (let t = 0; t <= 1; t += 0.01) {
        const x = (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * controlPointX + t * t * endX;
        const y = (1 - t) * (1 - t) * (height - 50) + 2 * (1 - t) * t * controlPointY + t * t * endY;
        graphics.lineTo(x, y);
      }

      missilePathsContainer.addChild(graphics);

      const missile = new PIXI.Graphics();
      missile.beginFill(0xff0000);
      missile.drawCircle(0, 0, 5);
      missile.endFill();
      missile.x = 100;
      missile.y = height - 50;
      missilePathsContainer.addChild(missile);

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

    return () => {
      // Fix: Check app before accessing stage
      if (app && app.stage) {
        try {
          app.stage.removeChild(missilePathsContainer);
          missilePathsContainer.destroy({ children: true });
        } catch (err) {
          console.error("Error cleaning up missile paths:", err);
        }
      }
    };
  }, [app, height, width]);

  return <div ref={pixiContainer} className={`${className} bg-transparent`} style={{ background: 'transparent' }} />;
};

export default PixiRenderer;
