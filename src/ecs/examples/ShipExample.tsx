
import React, { useRef, useEffect, useState } from 'react';
import { useECS } from '../hooks/useECS';
import { useSystem } from '../hooks/useSystem';
import { createMovementSystem } from '../systems/MovementSystem';
import { createRenderSystem, RenderingContext } from '../systems/RenderSystem';
import { createHealthSystem } from '../systems/HealthSystem';
import { createShipMovementSystem } from '../systems/ShipMovementSystem';
import { createPositionComponent, createVelocityComponent, createRotationComponent, createRenderableComponent } from '../components/common';
import { createShipComponent } from '../components/ship';

/**
 * Example component demonstrating the ECS with ships
 */
export const ShipExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windDirection, setWindDirection] = useState(45); // Default wind from NE
  const [windSpeed, setWindSpeed] = useState(10); // 10 knots
  const [isRunning, setIsRunning] = useState(false);
  
  // Initialize ECS
  const { ecs, createEntity, addComponent, startECS, stopECS } = useECS();
  
  // Set up render system when canvas is ready
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Create rendering context
    const renderingContext: RenderingContext = {
      ctx,
      width: canvas.width,
      height: canvas.height,
      clear: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
      imageCache: new Map()
    };
    
    // Create and add systems
    ecs.addSystem(createMovementSystem());
    ecs.addSystem(createRenderSystem(renderingContext));
    ecs.addSystem(createHealthSystem());
    ecs.addSystem(createShipMovementSystem(() => windDirection, () => windSpeed));
    
    // Create ship entities
    createShipEntity('Sloop', 'British', canvas.width / 2, canvas.height / 2, 45, '#3366CC');
    createShipEntity('Frigate', 'French', canvas.width / 4, canvas.height / 4, 90, '#CC3333');
    createShipEntity('Cutter', 'Spanish', canvas.width * 3/4, canvas.height * 3/4, 180, '#33CC33');
    
    // Handle canvas resize
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      renderingContext.width = canvas.width;
      renderingContext.height = canvas.height;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      stopECS();
    };
  }, [canvasRef, ecs, addComponent, createEntity, stopECS, windDirection, windSpeed]);
  
  // Create a ship entity
  const createShipEntity = (
    shipClass: any,
    nationality: string,
    x: number,
    y: number,
    heading: number,
    color: string
  ) => {
    const entity = createEntity();
    
    // Add components to the ship
    addComponent(entity.id, createPositionComponent(entity.id, x, y));
    addComponent(entity.id, createVelocityComponent(entity.id, 0, 0));
    addComponent(entity.id, createRotationComponent(entity.id, heading));
    addComponent(entity.id, createShipComponent(entity.id, shipClass as any, nationality));
    addComponent(entity.id, createRenderableComponent(entity.id, {
      shape: 'triangle',
      width: 30,
      height: 40,
      color,
      zIndex: 10
    }));
  };
  
  // Start/stop the simulation
  const toggleSimulation = () => {
    if (isRunning) {
      stopECS();
    } else {
      startECS();
    }
    setIsRunning(!isRunning);
  };
  
  // Update wind direction
  const handleWindDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWindDirection(Number(e.target.value));
  };
  
  // Update wind speed
  const handleWindSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWindSpeed(Number(e.target.value));
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 bg-gray-800 text-white flex space-x-4 items-center">
        <button 
          onClick={toggleSimulation}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          {isRunning ? 'Stop' : 'Start'} Simulation
        </button>
        
        <div className="flex flex-col">
          <label>
            Wind Direction: {windDirection}°
            <input 
              type="range" 
              min="0" 
              max="359" 
              value={windDirection} 
              onChange={handleWindDirectionChange}
              className="w-full"
            />
          </label>
        </div>
        
        <div className="flex flex-col">
          <label>
            Wind Speed: {windSpeed} knots
            <input 
              type="range" 
              min="0" 
              max="30" 
              value={windSpeed} 
              onChange={handleWindSpeedChange}
              className="w-full"
            />
          </label>
        </div>
      </div>
      
      <div className="flex-1 relative bg-blue-100">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Wind direction indicator */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-80 p-2 rounded">
          <div className="text-sm">Wind: {windDirection}° at {windSpeed} knots</div>
          <div 
            className="w-10 h-10 relative mt-1"
            style={{
              background: 'conic-gradient(from 0deg, rgba(255,255,255,0.8) 0%, rgba(200,200,255,0.8) 100%)'
            }}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${windDirection}deg)` }}
            >
              ↑
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
