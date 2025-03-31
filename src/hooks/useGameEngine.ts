// src/hooks/useGameEngine.ts
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameEngine } from '../engine/GameEngine';
import { GameState, GameConfig, ShipClass, Position, Team, Weather } from '../types/Game';

// Default game configuration
const defaultConfig: GameConfig = {
  gridSize: 100,
  tickRate: 60,
  initialWeather: 'clear',
  initialWindDirection: 0, // North
  initialWindSpeed: 10, // 10 knots
  timeOfDay: 'day',
  mapType: 'openSea',
  gameMode: 'realtime',
  victoryCondition: 'elimination',
};

export const useGameEngine = (config: Partial<GameConfig> = {}) => {
  // Combine default config with provided config
  const fullConfig: GameConfig = { ...defaultConfig, ...config };
  
  // Create game engine instance
  const [engine] = useState(() => new GameEngine(fullConfig));
  const [gameState, setGameState] = useState<GameState>(engine.getState());
  
  // Start/stop engine
  const startGame = useCallback(() => {
    engine.start();
  }, [engine]);
  
  const stopGame = useCallback(() => {
    engine.stop();
  }, [engine]);
  
  // Subscribe to engine updates
  useEffect(() => {
    const unsubscribe = engine.subscribe((state) => {
      setGameState(state);
    });
    
    return () => {
      unsubscribe();
      engine.stop();
    };
  }, [engine]);
  
  // Team management
  const createTeam = useCallback((name: string, nationality: string, color: string, isPlayerControlled: boolean = false, aiPersonality?: string): string => {
    const team: Team = {
      id: uuidv4(),
      name,
      nationality,
      color,
      isPlayerControlled,
      aiPersonality,
      resources: {
        gold: 1000,
        supplies: 500,
        ammunition: 500,
        repairMaterials: 300
      }
    };
    
    const newState = engine.getState();
    newState.teams.push(team);
    
    return team.id;
  }, [engine]);
  
  // Ship creation with presets
  const createShipPreset = useCallback((
    shipClass: ShipClass,
    position: Position,
    teamId: string,
    nationality: string
  ): string => {
    return engine.createShipPreset(shipClass, position, teamId, nationality);
  }, [engine]);
  
  // Ship controls
  const setCourseAndSpeed = useCallback((
    shipId: string,
    course: number,
    speed: number
  ) => {
    engine.setCourseAndSpeed(shipId, course, speed);
  }, [engine]);
  
  const setSailConfiguration = useCallback((
    shipId: string,
    config: 'full' | 'battle' | 'reduced' | 'minimal' | 'none'
  ) => {
    engine.setSailConfiguration(shipId, config);
  }, [engine]);
  
  const fireCannons = useCallback((
    shipId: string,
    side: 'port' | 'starboard' | 'bow' | 'stern',
    targetId?: string
  ) => {
    engine.fireCannons(shipId, side, targetId);
  }, [engine]);
  
  const initiateBoarding = useCallback((
    attackerId: string,
    defenderId: string
  ) => {
    engine.initiateBoarding(attackerId, defenderId);
  }, [engine]);
  
  const repairShip = useCallback((
    shipId: string,
    repairType: 'hull' | 'rigging' | 'mast' | 'rudder' | 'fire'
  ) => {
    engine.repairShip(shipId, repairType);
  }, [engine]);
  
  // Weather controls
  const setWeather = useCallback((weather: Weather) => {
    engine.setWeather(weather);
  }, [engine]);
  
  const setWind = useCallback((direction: number, speed: number) => {
    engine.setWindDirection(direction);
    engine.setWindSpeed(speed);
  }, [engine]);
  
  // Scenario setup
  const setupHistoricalBattle = useCallback((battleName: string) => {
    // Create teams and ships based on historical battles
    switch (battleName) {
      case 'trafalgar': {
        // Create British and Franco-Spanish fleets
        const britishTeamId = createTeam('Royal Navy', 'british', '#003399', true);
        const frenchTeamId = createTeam('French Navy', 'french', '#00209F', false, 'aggressive');
        const spanishTeamId = createTeam('Spanish Navy', 'spanish', '#AA151B', false, 'defensive');
        
        // British Fleet
        createShipPreset('FirstRate', { x: 20, y: 20 }, britishTeamId, 'british'); // HMS Victory
        createShipPreset('SecondRate', { x: 22, y: 22 }, britishTeamId, 'british'); // Royal Sovereign
        createShipPreset('ThirdRate', { x: 24, y: 24 }, britishTeamId, 'british');
        createShipPreset('ThirdRate', { x: 26, y: 26 }, britishTeamId, 'british');
        createShipPreset('FourthRate', { x: 28, y: 28 }, britishTeamId, 'british');
        
        // French Fleet
        createShipPreset('FirstRate', { x: 60, y: 60 }, frenchTeamId, 'french'); // Bucentaure
        createShipPreset('SecondRate', { x: 62, y: 62 }, frenchTeamId, 'french');
        createShipPreset('ThirdRate', { x: 64, y: 64 }, frenchTeamId, 'french');
        
        // Spanish Fleet
        createShipPreset('FirstRate', { x: 70, y: 60 }, spanishTeamId, 'spanish'); // Santísima Trinidad
        createShipPreset('SecondRate', { x: 72, y: 62 }, spanishTeamId, 'spanish');
        
        // Set weather conditions for the battle
        setWeather('clear');
        setWind(135, 12); // SE wind at 12 knots
        
        break;
      }
      
      case 'nile': {
        // Battle of the Nile
        const britishTeamId = createTeam('Royal Navy', 'british', '#003399', true);
        const frenchTeamId = createTeam('French Navy', 'french', '#00209F', false, 'defensive');
        
        // British Fleet
        createShipPreset('SecondRate', { x: 30, y: 30 }, britishTeamId, 'british'); // HMS Vanguard
        createShipPreset('ThirdRate', { x: 32, y: 32 }, britishTeamId, 'british');
        createShipPreset('ThirdRate', { x: 34, y: 34 }, britishTeamId, 'british');
        createShipPreset('FourthRate', { x: 36, y: 36 }, britishTeamId, 'british');
        
        // French Fleet
        createShipPreset('FirstRate', { x: 60, y: 30 }, frenchTeamId, 'french'); // L'Orient
        createShipPreset('SecondRate', { x: 62, y: 32 }, frenchTeamId, 'french');
        createShipPreset('SecondRate', { x: 64, y: 34 }, frenchTeamId, 'french');
        createShipPreset('ThirdRate', { x: 66, y: 36 }, frenchTeamId, 'french');
        
        // Set weather conditions
        setWeather('clear');
        setWind(0, 8); // North wind at 8 knots
        
        break;
      }
      
      case 'chesapeake': {
        // Battle of Chesapeake Bay
        const britishTeamId = createTeam('Royal Navy', 'british', '#003399', true);
        const frenchTeamId = createTeam('French Navy', 'french', '#00209F', false, 'aggressive');
        
        // British Fleet
        createShipPreset('SecondRate', { x: 40, y: 20 }, britishTeamId, 'british');
        createShipPreset('ThirdRate', { x: 42, y: 22 }, britishTeamId, 'british');
        createShipPreset('ThirdRate', { x: 44, y: 24 }, britishTeamId, 'british');
        createShipPreset('FourthRate', { x: 46, y: 26 }, britishTeamId, 'british');
        
        // French Fleet
        createShipPreset('FirstRate', { x: 40, y: 60 }, frenchTeamId, 'french');
        createShipPreset('SecondRate', { x: 42, y: 62 }, frenchTeamId, 'french');
        createShipPreset('SecondRate', { x: 44, y: 64 }, frenchTeamId, 'french');
        createShipPreset('ThirdRate', { x: 46, y: 66 }, frenchTeamId, 'french');
        createShipPreset('FourthRate', { x: 48, y: 68 }, frenchTeamId, 'french');
        
        // Set weather conditions
        setWeather('cloudy');
        setWind(45, 10); // NE wind at 10 knots
        
        break;
      }
      
      default:
        console.error(`Unknown battle: ${battleName}`);
    }
  }, [createTeam, createShipPreset, setWeather, setWind]);
  
  // Custom scenario
  const setupCustomBattle = useCallback((
    playerNation: string, 
    enemyNation: string, 
    playerFleetSize: number, 
    enemyFleetSize: number,
    mapType: 'openSea' | 'coastal' | 'archipelago' | 'harbor'
  ) => {
    // Create teams
    const playerTeamId = createTeam(`${playerNation.charAt(0).toUpperCase() + playerNation.slice(1)} Navy`, playerNation, '#003399', true);
    const enemyTeamId = createTeam(`${enemyNation.charAt(0).toUpperCase() + enemyNation.slice(1)} Navy`, enemyNation, '#AA151B', false);
    
    // Helper to get a random position on the map
    const getRandomPosition = (): Position => {
      if (mapType === 'openSea') {
        return { 
          x: 10 + Math.random() * 80, 
          y: 10 + Math.random() * 80 
        };
      } else if (mapType === 'coastal') {
        return {
          x: 10 + Math.random() * 40,
          y: 10 + Math.random() * 80
        };
      } else if (mapType === 'archipelago') {
        // Return positions avoiding the "islands" in the middle
        return {
          x: 10 + Math.random() * 80,
          y: (Math.random() > 0.5) ? 10 + Math.random() * 30 : 70 + Math.random() * 20
        };
      } else {
        // Harbor map - player starts inside harbor
        if (Math.random() > 0.5) {
          return {
            x: 10 + Math.random() * 20,
            y: 50 + Math.random() * 30
          };
        } else {
          return {
            x: 70 + Math.random() * 20,
            y: 10 + Math.random() * 30
          };
        }
      }
    };
    
    // Helper to get ship class based on fleet composition
    const getShipClass = (index: number, totalShips: number): ShipClass => {
      // Larger fleets have lighter ships on average
      const fleetSizeFactor = 1 - (totalShips / 20); // 0.5 for fleet of 10, 0.75 for fleet of 5
      
      // Position in fleet - flagship is most powerful
      const positionFactor = 1 - (index / totalShips);
      
      const power = fleetSizeFactor * positionFactor;
      
      if (power > 0.8) return 'FirstRate';
      if (power > 0.7) return 'SecondRate';
      if (power > 0.6) return 'ThirdRate';
      if (power > 0.5) return 'FourthRate';
      if (power > 0.4) return 'FifthRate';
      if (power > 0.3) return 'SixthRate';
      if (power > 0.2) return 'Sloop';
      return 'Cutter';
    };
    
    // Create player fleet
    const playerBaseX = playerNation === 'british' ? 20 : 80;
    const playerBaseY = 20;
    
    for (let i = 0; i < playerFleetSize; i++) {
      const shipClass = getShipClass(i, playerFleetSize);
      createShipPreset(
        shipClass,
        { x: playerBaseX + (i % 3) * 4, y: playerBaseY + Math.floor(i / 3) * 4 },
        playerTeamId,
        playerNation
      );
    }
    
    // Create enemy fleet
    const enemyBaseX = enemyNation === 'british' ? 20 : 80;
    const enemyBaseY = 80;
    
    for (let i = 0; i < enemyFleetSize; i++) {
      const shipClass = getShipClass(i, enemyFleetSize);
      createShipPreset(
        shipClass,
        { x: enemyBaseX + (i % 3) * 4, y: enemyBaseY - Math.floor(i / 3) * 4 },
        enemyTeamId,
        enemyNation
      );
    }
    
    // Set random weather conditions
    const weathers: Weather[] = ['clear', 'cloudy', 'rain', 'fog'];
    const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
    setWeather(randomWeather);
    
    // Random wind direction and speed
    const windDirection = Math.random() * 360;
    const windSpeed = 5 + Math.random() * 10;
    setWind(windDirection, windSpeed);
    
  }, [createTeam, createShipPreset, setWeather, setWind]);
  
  return {
    gameState,
    startGame,
    stopGame,
    createTeam,
    createShipPreset,
    setCourseAndSpeed,
    setSailConfiguration,
    fireCannons,
    initiateBoarding,
    repairShip,
    setWeather,
    setWind,
    setupHistoricalBattle,
    setupCustomBattle,
  };
};
