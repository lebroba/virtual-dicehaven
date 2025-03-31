
import { useState, useEffect, useCallback } from 'react';
import { ShipEntity, createShipEntity, createShipPreset } from '../engine/ShipEntity';

/**
 * Custom hook for working with ship entities in React components
 */
export function useShipEntity(initialShip?: ShipEntity) {
  const [ship, setShip] = useState<ShipEntity | undefined>(initialShip);
  const [position, setPosition] = useState({ x: initialShip?.x || 0, y: initialShip?.y || 0 });
  const [rotation, setRotation] = useState(initialShip?.rotation || 0);
  const [health, setHealth] = useState(initialShip?.attributes.health || 100);
  const [speed, setSpeed] = useState(initialShip?.attributes.speed || 0);
  
  // Create a new ship
  const createShip = useCallback((
    type: string = 'sloop', 
    isPlayer: boolean = false,
    x: number = 0,
    y: number = 0,
    rotation: number = 0
  ) => {
    const newShip = createShipEntity(type, isPlayer, x, y, rotation);
    setShip(newShip);
    setPosition({ x, y });
    setRotation(rotation);
    setHealth(newShip.attributes.health);
    setSpeed(newShip.attributes.speed);
    return newShip;
  }, []);
  
  // Create a ship from a preset
  const createFromPreset = useCallback((presetName: 'playerSloop' | 'enemyFrigate' | 'alliedCutter' | 'bossManOfWar') => {
    const newShip = createShipPreset(presetName);
    setShip(newShip);
    setPosition({ x: newShip.x, y: newShip.y });
    setRotation(newShip.rotation);
    setHealth(newShip.attributes.health);
    setSpeed(newShip.attributes.speed);
    return newShip;
  }, []);
  
  // Set the ship speed
  const setShipSpeed = useCallback((newSpeed: number) => {
    if (ship) {
      ship.setSpeed(newSpeed);
      setSpeed(ship.attributes.speed);
    }
  }, [ship]);
  
  // Apply damage to the ship
  const applyDamage = useCallback((amount: number) => {
    if (ship) {
      ship.applyDamage(amount);
      setHealth(ship.attributes.health);
      return ship.attributes.health;
    }
    return 0;
  }, [ship]);
  
  // Repair the ship
  const repairShip = useCallback((amount: number) => {
    if (ship) {
      ship.repair(amount);
      setHealth(ship.attributes.health);
      return ship.attributes.health;
    }
    return 0;
  }, [ship]);
  
  // Fire cannons
  const fireCannons = useCallback((side: 'port' | 'starboard' | 'bow' | 'stern') => {
    if (ship) {
      return ship.fireCannons(side);
    }
    return false;
  }, [ship]);
  
  // Update ship state on each animation frame
  useEffect(() => {
    if (!ship) return;
    
    // Set up update loop
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const updateShip = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      ship.update(deltaTime);
      
      // Update react state with new values
      setPosition({ x: ship.x, y: ship.y });
      setRotation(ship.rotation);
      setHealth(ship.attributes.health);
      setSpeed(ship.attributes.speed);
      
      animationFrameId = requestAnimationFrame(updateShip);
    };
    
    animationFrameId = requestAnimationFrame(updateShip);
    
    // Clean up on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ship]);
  
  return {
    ship,
    position,
    rotation,
    health,
    speed,
    createShip,
    createFromPreset,
    setShipSpeed,
    applyDamage,
    repairShip,
    fireCannons
  };
}
