
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useShipEntity } from '../hooks/useShipEntity';

interface ShipDebugViewProps {
  width?: number;
  height?: number;
}

export default function ShipDebugView({ width = 600, height = 400 }: ShipDebugViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  
  const { 
    ship, 
    position, 
    rotation, 
    health, 
    speed,
    createFromPreset,
    setShipSpeed,
    applyDamage,
    repairShip
  } = useShipEntity();
  
  // Initialize PIXI app on mount
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create PIXI application
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x0A2463,
      antialias: true
    });
    
    // Add to DOM
    containerRef.current.appendChild(app.view as unknown as Node);
    appRef.current = app;
    
    // Create initial graphics
    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);
    graphicsRef.current = graphics;
    
    // Create player ship
    createFromPreset('playerSloop');
    
    // Clean up on unmount
    return () => {
      app.destroy(true);
      if (containerRef.current?.contains(app.view as unknown as Node)) {
        containerRef.current?.removeChild(app.view as unknown as Node);
      }
    };
  }, [createFromPreset]);
  
  // Update PIXI graphics when ship changes
  useEffect(() => {
    if (!ship || !graphicsRef.current || !appRef.current) return;
    
    const app = appRef.current;
    const graphics = graphicsRef.current;
    
    // Clear previous graphics
    graphics.clear();
    
    // Create new ship visualization
    graphics.beginFill(0x3E92CC);
    graphics.drawPolygon([
      0, -15,  // top point
      -8, 15,  // bottom left
      8, 15    // bottom right
    ]);
    graphics.endFill();
    
    // Draw direction indicator
    graphics.lineStyle(2, 0xFFFFFF);
    graphics.moveTo(0, -15);
    graphics.lineTo(0, -25);
    
    // Draw health bar
    const healthPercent = health / (ship?.attributes.maxHealth || 100);
    graphics.lineStyle(0);
    
    // Health bar background
    graphics.beginFill(0x333333);
    graphics.drawRect(-20, -35, 40, 5);
    graphics.endFill();
    
    // Health bar fill
    const barColor = healthPercent > 0.6 ? 0x44CF6C : healthPercent > 0.3 ? 0xFFD23F : 0xFF5714;
    graphics.beginFill(barColor);
    graphics.drawRect(-20, -35, 40 * healthPercent, 5);
    graphics.endFill();
    
    // Position and rotate
    graphics.x = width / 2;
    graphics.y = height / 2;
    graphics.rotation = rotation * Math.PI / 180;
    
    // Add wake effect when moving
    if (speed > 0) {
      graphics.lineStyle(1, 0xFFFFFF, 0.5);
      graphics.moveTo(-5, 15);
      graphics.lineTo(-10, 30);
      graphics.moveTo(5, 15);
      graphics.lineTo(10, 30);
    }
    
    // Add a grid for reference
    const gridGraphics = new PIXI.Graphics();
    app.stage.addChildAt(gridGraphics, 0);
    gridGraphics.lineStyle(0.5, 0xFFFFFF, 0.2);
    
    // Draw grid lines
    for (let i = 0; i <= width; i += 50) {
      gridGraphics.moveTo(i, 0);
      gridGraphics.lineTo(i, height);
    }
    
    for (let i = 0; i <= height; i += 50) {
      gridGraphics.moveTo(0, i);
      gridGraphics.lineTo(width, i);
    }
    
  }, [ship, position, rotation, health, speed, width, height]);

  return (
    <div className="flex flex-col space-y-4">
      <div ref={containerRef} className="border-2 border-gray-700 rounded-md overflow-hidden"></div>
      
      <div className="flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">Position: </div>
          <div className="text-sm">{`X: ${Math.round(position.x)}, Y: ${Math.round(position.y)}`}</div>
          
          <div className="text-sm font-medium">Rotation: </div>
          <div className="text-sm">{`${Math.round(rotation)}°`}</div>
          
          <div className="text-sm font-medium">Health: </div>
          <div className="text-sm">{`${Math.round(health)} / ${ship?.attributes.maxHealth || 100}`}</div>
          
          <div className="text-sm font-medium">Speed: </div>
          <div className="text-sm">{`${speed.toFixed(1)} / ${ship?.attributes.maxSpeed || 10}`}</div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button 
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            onClick={() => setShipSpeed(ship?.attributes.maxSpeed || 10)}
          >
            Full Speed
          </button>
          <button 
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            onClick={() => setShipSpeed((ship?.attributes.maxSpeed || 10) / 2)}
          >
            Half Speed
          </button>
          <button 
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            onClick={() => setShipSpeed(0)}
          >
            Stop
          </button>
          <button 
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            onClick={() => applyDamage(10)}
          >
            Take 10 Damage
          </button>
          <button 
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
            onClick={() => repairShip(10)}
          >
            Repair 10
          </button>
        </div>
      </div>
    </div>
  );
}
