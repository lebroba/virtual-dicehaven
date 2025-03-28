// src/engine/GameEngine.ts
import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, 
  GameConfig, 
  Entity, 
  GameEvent, 
  ShipEntity, 
  ShipClass, 
  Weather,
  WeatherEvent,
  Position,
  DamageEvent,
  CombatEvent
} from '../types/Game';

export class GameEngine {
  private state: GameState;
  private config: GameConfig;
  private animationFrameId: number | null = null;
  private callbacks: ((state: GameState) => void)[] = [];
  private fixedTimeStep: number = 1 / 60; // 60 FPS fixed update rate
  private accumulator: number = 0;
  private weatherUpdateTimer: number = 0;
  private weatherUpdateInterval: number = 300; // Weather changes every 5 minutes

  constructor(config: GameConfig) {
    this.config = config;
    this.state = {
      isRunning: false,
      lastUpdate: performance.now(),
      deltaTime: 0,
      entities: [],
      eventQueue: [],
      windDirection: config.initialWindDirection,
      windSpeed: config.initialWindSpeed,
      weather: config.initialWeather,
      teams: [],
      turn: 1,
      gameMode: config.gameMode,
      timeScale: 1,
    };
  }

  start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.state.lastUpdate = performance.now();
    this.accumulator = 0; // Reset accumulator on start
    this.gameLoop();
  }

  stop() {
    this.state.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  addEntity(entity: Entity) {
    this.state.entities.push(entity);
    return entity.id;
  }

  createShip(
    position: Position, 
    shipClass: ShipClass, 
    teamId: string, 
    name: string,
    nationality: string
  ): string {
    // Ship stats based on class
    const shipStats = this.getShipStats(shipClass);
    
    const ship: ShipEntity = {
      id: uuidv4(),
      position,
      velocity: { x: 0, y: 0 },
      rotation: 0, // Initial heading north
      type: 'ship',
      status: 'idle',
      teamId,
      name,
      shipClass,
      currentHealth: shipStats.health,
      maxHealth: shipStats.health,
      currentCrew: shipStats.crew,
      maxCrew: shipStats.crew,
      currentSupplies: shipStats.supplies,
      maxSupplies: shipStats.supplies,
      currentSpeed: 0,
      maxSpeed: shipStats.speed,
      maneuverability: shipStats.maneuverability,
      visibilityRange: shipStats.visibilityRange,
      nationality,
      experienceLevel: 1, // Default experience level
      sailConfiguration: {
        mainSails: 0,
        topSails: 0,
        jibs: 0,
        spanker: 0,
        currentConfig: 'none'
      },
      cannons: this.generateCannons(shipClass),
      damageState: {
        hullIntegrity: 100,
        rigDamage: 0,
        rudderDamage: 0,
        masts: {
          fore: 100,
          main: 100,
          mizzen: 100
        },
        onFire: false,
        floodingRate: 0,
        crewCasualties: 0
      }
    };
    
    return this.addEntity(ship);
  }

  private getShipStats(shipClass: ShipClass): {
    health: number;
    crew: number;
    supplies: number;
    speed: number;
    maneuverability: number;
    visibilityRange: number;
  } {
    switch (shipClass) {
      case 'FirstRate':
        return {
          health: 1200,
          crew: 850,
          supplies: 1000,
          speed: 8,
          maneuverability: 2,
          visibilityRange: 15
        };
      case 'SecondRate':
        return {
          health: 1000,
          crew: 750,
          supplies: 900,
          speed: 9,
          maneuverability: 3,
          visibilityRange: 14
        };
      case 'ThirdRate':
        return {
          health: 800,
          crew: 650,
          supplies: 800,
          speed: 10,
          maneuverability: 4,
          visibilityRange: 13
        };
      case 'FourthRate':
        return {
          health: 600,
          crew: 450,
          supplies: 600,
          speed: 11,
          maneuverability: 5,
          visibilityRange: 12
        };
      case 'FifthRate':
        return {
          health: 400,
          crew: 300,
          supplies: 400,
          speed: 13,
          maneuverability: 6,
          visibilityRange: 11
        };
      case 'SixthRate':
        return {
          health: 300,
          crew: 200,
          supplies: 300,
          speed: 14,
          maneuverability: 7,
          visibilityRange: 10
        };
      case 'Sloop':
        return {
          health: 200,
          crew: 120,
          supplies: 200,
          speed: 16,
          maneuverability: 8,
          visibilityRange: 9
        };
      case 'Cutter':
        return {
          health: 100,
          crew: 80,
          supplies: 150,
          speed: 18,
          maneuverability: 10,
          visibilityRange: 8
        };
      case 'Fireship':
        return {
          health: 150,
          crew: 40,
          supplies: 100,
          speed: 12,
          maneuverability: 6,
          visibilityRange: 7
        };
      default:
        return {
          health: 100,
          crew: 50,
          supplies: 100,
          speed: 10,
          maneuverability: 5,
          visibilityRange: 10
        };
    }
  }

  private generateCannons(shipClass: ShipClass) {
    const cannons = [];
    let cannonCount = 0;
    let caliber = 0;
    
    switch (shipClass) {
      case 'FirstRate':
        cannonCount = 104;
        caliber = 32;
        break;
      case 'SecondRate':
        cannonCount = 90;
        caliber = 24;
        break;
      case 'ThirdRate':
        cannonCount = 74;
        caliber = 18;
        break;
      case 'FourthRate':
        cannonCount = 50;
        caliber = 12;
        break;
      case 'FifthRate':
        cannonCount = 36;
        caliber = 9;
        break;
      case 'SixthRate':
        cannonCount = 24;
        caliber = 6;
        break;
      case 'Sloop':
        cannonCount = 16;
        caliber = 6;
        break;
      case 'Cutter':
        cannonCount = 10;
        caliber = 4;
        break;
      case 'Fireship':
        cannonCount = 8;
        caliber = 4;
        break;
    }
    
    // Port side cannons
    const portCount = Math.floor(cannonCount / 2);
    for (let i = 0; i < portCount; i++) {
      cannons.push({
        type: 'long',
        caliber,
        location: 'port',
        range: caliber * 10, // Range is proportional to caliber
        reloadTime: 20 - (caliber / 8), // Larger calibers reload slower
        currentReload: 0,
        ammunition: 'roundshot',
        status: 'ready'
      });
    }
    
    // Starboard side cannons
    const starboardCount = Math.floor(cannonCount / 2);
    for (let i = 0; i < starboardCount; i++) {
      cannons.push({
        type: 'long',
        caliber,
        location: 'starboard',
        range: caliber * 10,
        reloadTime: 20 - (caliber / 8),
        currentReload: 0,
        ammunition: 'roundshot',
        status: 'ready'
      });
    }
    
    // Bow and stern chasers for larger ships
    if (cannonCount >= 50) {
      // Bow chasers
      cannons.push({
        type: 'long',
        caliber: Math.floor(caliber / 2),
        location: 'bow',
        range: caliber * 12, // Longer range for chasers
        reloadTime: 15 - (caliber / 10),
        currentReload: 0,
        ammunition: 'roundshot',
        status: 'ready'
      });
      cannons.push({
        type: 'long',
        caliber: Math.floor(caliber / 2),
        location: 'bow',
        range: caliber * 12,
        reloadTime: 15 - (caliber / 10),
        currentReload: 0,
        ammunition: 'roundshot',
        status: 'ready'
      });
      
      // Stern chasers
      cannons.push({
        type: 'long',
        caliber: Math.floor(caliber / 2),
        location: 'stern',
        range: caliber * 12,
        reloadTime: 15 - (caliber / 10),
        currentReload: 0,
        ammunition: 'roundshot',
        status: 'ready'
      });
      cannons.push({
        type: 'long',
        caliber: Math.floor(caliber / 2),
        location: 'stern',
        range: caliber * 12,
        reloadTime: 15 - (caliber / 10),
        currentReload: 0,
        ammunition: 'roundshot',
        status: 'ready'
      });
    }
    
    return cannons;
  }

  removeEntity(id: string) {
    this.state.entities = this.state.entities.filter((e) => e.id !== id);
  }

  subscribe(callback: (state: GameState) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  addEvent(event: GameEvent) {
    this.state.eventQueue.push(event);
  }

  setWindDirection(direction: number) {
    this.state.windDirection = direction;
    this.addEvent({
      type: 'windChange',
      newWindDirection: direction
    } as WeatherEvent);
  }

  setWindSpeed(speed: number) {
    this.state.windSpeed = speed;
    this.addEvent({
      type: 'windChange',
      newWindSpeed: speed
    } as WeatherEvent);
  }

  setWeather(weather: Weather) {
    this.state.weather = weather;
    this.addEvent({
      type: 'weatherChange',
      newWeather: weather
    } as WeatherEvent);
  }

  // Set sail configuration for a ship
  setSailConfiguration(shipId: string, config: 'full' | 'battle' | 'reduced' | 'minimal' | 'none') {
    const ship = this.getShipById(shipId) as ShipEntity;
    if (!ship) return;
    
    switch (config) {
      case 'full':
        ship.sailConfiguration = {
          mainSails: 100,
          topSails: 100,
          jibs: 100,
          spanker: 100,
          currentConfig: 'full'
        };
        break;
      case 'battle':
        ship.sailConfiguration = {
          mainSails: 80,
          topSails: 50,
          jibs: 70,
          spanker: 80,
          currentConfig: 'battle'
        };
        break;
      case 'reduced':
        ship.sailConfiguration = {
          mainSails: 50,
          topSails: 30,
          jibs: 50,
          spanker: 50,
          currentConfig: 'reduced'
        };
        break;
      case 'minimal':
        ship.sailConfiguration = {
          mainSails: 30,
          topSails: 0,
          jibs: 20,
          spanker: 20,
          currentConfig: 'minimal'
        };
        break;
      case 'none':
      default:
        ship.sailConfiguration = {
          mainSails: 0,
          topSails: 0,
          jibs: 0,
          spanker: 0,
          currentConfig: 'none'
        };
        break;
    }
  }

  // Fire cannons from a ship
  fireCannons(shipId: string, side: 'port' | 'starboard' | 'bow' | 'stern', targetId?: string) {
    const ship = this.getShipById(shipId) as ShipEntity;
    if (!ship) return;
    
    const cannonsToFire = ship.cannons.filter(c => 
      c.location === side && c.status === 'ready'
    );
    
    if (cannonsToFire.length === 0) return;
    
    // Fire each cannon and set to reloading
    cannonsToFire.forEach(cannon => {
      cannon.status = 'reloading';
      cannon.currentReload = cannon.reloadTime;
      
      this.addEvent({
        type: 'cannonFire',
        entityId: shipId,
        targetId,
        side,
        ammunition: cannon.ammunition
      } as CombatEvent);
      
      // If we have a target, calculate if we hit and apply damage
      if (targetId) {
        const target = this.getShipById(targetId) as ShipEntity;
        if (target) {
          this.resolveCannonFire(ship, target, cannon);
        }
      }
    });
  }

  // Resolve cannon fire effects
  private resolveCannonFire(
    firingShip: ShipEntity, 
    targetShip: ShipEntity, 
    cannon: any
  ) {
    // Calculate distance between ships
    const distance = this.calculateDistance(firingShip.position, targetShip.position);
    
    // Check if target is in range
    if (distance > cannon.range) return;
    
    // Calculate hit chance based on distance, weather, and crew experience
    let hitChance = 0.7; // Base chance
    
    // Distance modifier: closer = higher chance
    hitChance *= 1 - (distance / cannon.range) * 0.5;
    
    // Weather modifier
    if (this.state.weather === 'fog' || this.state.weather === 'heavyRain') {
      hitChance *= 0.7;
    } else if (this.state.weather === 'rain') {
      hitChance *= 0.85;
    }
    
    // Crew experience modifier
    hitChance *= 0.8 + (firingShip.experienceLevel * 0.05);
    
    // Roll for hit
    const hitRoll = Math.random();
    if (hitRoll <= hitChance) {
      // Determine damage based on ammunition type
      let damage = cannon.caliber * 2; // Base damage from caliber
      let damageType: 'hull' | 'rigging' | 'mast' | 'rudder' | 'crew' = 'hull';
      
      switch (cannon.ammunition) {
        case 'chainshot':
          damage *= 0.7;
          damageType = Math.random() > 0.5 ? 'rigging' : 'mast';
          break;
        case 'grapeshot':
          damage *= 0.5;
          damageType = 'crew';
          break;
        case 'doubleshot':
          damage *= 1.3;
          break;
        case 'hotshot':
          damage *= 0.8;
          // Chance to start fire
          if (Math.random() > 0.7) {
            targetShip.damageState.onFire = true;
          }
          break;
      }
      
      // Check for critical hit
      const isCritical = Math.random() > 0.9;
      if (isCritical) {
        damage *= 1.5;
        
        // Determine critical hit location
        const critLocation = Math.random();
        if (critLocation < 0.3) {
          damageType = 'mast';
        } else if (critLocation < 0.5) {
          damageType = 'rudder';
        } else if (critLocation < 0.7) {
          damageType = 'rigging';
        }
      }
      
      // Apply damage
      this.applyDamage(targetShip, damageType, damage, isCritical);
    }
  }

  // Apply damage to a ship
  private applyDamage(
    ship: ShipEntity, 
    damageType: 'hull' | 'rigging' | 'mast' | 'rudder' | 'crew',
    amount: number,
    isCritical: boolean
  ) {
    switch (damageType) {
      case 'hull':
        ship.currentHealth -= amount;
        ship.damageState.hullIntegrity -= amount / ship.maxHealth * 100;
        
        // Increase flooding based on hull damage
        if (ship.damageState.hullIntegrity < 50) {
          ship.damageState.floodingRate += amount / 200;
        }
        break;
      
      case 'rigging':
        ship.damageState.rigDamage += amount / 5;
        break;
      
      case 'mast':
        // Randomly damage a mast
        const mast = Math.random();
        if (mast < 0.33) {
          ship.damageState.masts.fore -= amount / 3;
        } else if (mast < 0.66) {
          ship.damageState.masts.main -= amount / 3;
        } else {
          ship.damageState.masts.mizzen -= amount / 3;
        }
        break;
      
      case 'rudder':
        ship.damageState.rudderDamage += amount / 4;
        break;
      
      case 'crew':
        const crewDamage = Math.ceil(amount / 2);
        ship.currentCrew -= crewDamage;
        ship.damageState.crewCasualties += crewDamage;
        break;
    }
    
    // Ensure values don't go below 0
    ship.currentHealth = Math.max(0, ship.currentHealth);
    ship.damageState.hullIntegrity = Math.max(0, ship.damageState.hullIntegrity);
    ship.damageState.rigDamage = Math.min(100, Math.max(0, ship.damageState.rigDamage));
    ship.damageState.rudderDamage = Math.min(100, Math.max(0, ship.damageState.rudderDamage));
    ship.damageState.masts.fore = Math.max(0, ship.damageState.masts.fore);
    ship.damageState.masts.main = Math.max(0, ship.damageState.masts.main);
    ship.damageState.masts.mizzen = Math.max(0, ship.damageState.masts.mizzen);
    ship.currentCrew = Math.max(0, ship.currentCrew);
    
    // Check if ship is sinking
    if (ship.currentHealth <= 0 || ship.damageState.hullIntegrity <= 0) {
      ship.status = 'sinking';
    }
    
    // Add damage event
    this.addEvent({
      type: 'shipDamage',
      entityId: ship.id,
      damageType,
      amount,
      isCritical
    } as DamageEvent);
  }

  // Start a boarding action
  initiateBoarding(attackerId: string, defenderId: string) {
    const attacker = this.getShipById(attackerId) as ShipEntity;
    const defender = this.getShipById(defenderId) as ShipEntity;
    
    if (!attacker || !defender) return;
    
    // Check if ships are close enough
    const distance = this.calculateDistance(attacker.position, defender.position);
    if (distance > 0.5) return; // Ships must be very close
    
    // Add boarding event
    this.addEvent({
      type: 'boardingStart',
      attackerId,
      defenderId
    });
    
    // Set both ships to boarding status
    attacker.status = 'boarding';
    defender.status = 'boarding';
    
    // Resolve boarding in next update
    setTimeout(() => this.resolveBoarding(attacker, defender), 5000);
  }

  // Resolve a boarding action
  private resolveBoarding(attacker: ShipEntity, defender: ShipEntity) {
    // Calculate boarding success based on crew numbers, experience, and ship status
    let attackerStrength = attacker.currentCrew * (0.8 + attacker.experienceLevel * 0.05);
    let defenderStrength = defender.currentCrew * (0.8 + defender.experienceLevel * 0.05);
    
    // Damage and morale modifiers
    attackerStrength *= 1 - (attacker.damageState.hullIntegrity / 200); // Damaged ships have lower morale
    defenderStrength *= 1 - (defender.damageState.hullIntegrity / 200);
    
    // Randomness factor
    attackerStrength *= 0.8 + (Math.random() * 0.4); // ±20% random factor
    defenderStrength *= 0.8 + (Math.random() * 0.4);
    
    // Determine winner
    const attackerVictory = attackerStrength > defenderStrength;
    
    // Calculate casualties
    const attackerCasualties = Math.floor(attacker.currentCrew * (0.1 + Math.random() * 0.2));
    const defenderCasualties = Math.floor(defender.currentCrew * (0.1 + Math.random() * 0.3));
    
    attacker.currentCrew -= attackerCasualties;
    defender.currentCrew -= defenderCasualties;
    
    // Update casualty counts
    attacker.damageState.crewCasualties += attackerCasualties;
    defender.damageState.crewCasualties += defenderCasualties;
    
    // Ensure crew doesn't go below 0
    attacker.currentCrew = Math.max(0, attacker.currentCrew);
    defender.currentCrew = Math.max(0, defender.currentCrew);
    
    // Handle victory/defeat
    if (attackerVictory) {
      // Attacker captures the ship if enough crew left to man it
      if (attacker.currentCrew > defender.maxCrew * 0.3) {
        defender.teamId = attacker.teamId;
        defender.nationality = attacker.nationality;
        
        // Transfer some crew to captured ship
        const transferCrew = Math.min(
          attacker.currentCrew * 0.3,
          defender.maxCrew * 0.5
        );
        attacker.currentCrew -= transferCrew;
        defender.currentCrew = transferCrew;
      }
    }
    
    // End boarding status
    attacker.status = 'idle';
    defender.status = 'idle';
    
    // Add boarding result event
    this.addEvent({
      type: 'boardingResult',
      attackerId: attacker.id,
      defenderId: defender.id,
      result: attackerVictory ? 'success' : 'failure'
    });
  }

  // Repair a ship
  repairShip(shipId: string, repairType: 'hull' | 'rigging' | 'mast' | 'rudder' | 'fire') {
    const ship = this.getShipById(shipId) as ShipEntity;
    if (!ship) return;
    
    // Check if ship has enough crew to make repairs
    if (ship.currentCrew < ship.maxCrew * 0.3) return;
    
    // Set ship status to repairing
    ship.status = 'repairing';
    
    // Calculate repair amount based on crew available
    const repairEfficiency = ship.currentCrew / ship.maxCrew;
    let repairAmount = 0;
    
    switch (repairType) {
      case 'hull':
        repairAmount = 10 * repairEfficiency;
        ship.currentHealth += repairAmount;
        ship.damageState.hullIntegrity += repairAmount / ship.maxHealth * 100;
        
        // Cap at maximum
        ship.currentHealth = Math.min(ship.maxHealth, ship.currentHealth);
        ship.damageState.hullIntegrity = Math.min(100, ship.damageState.hullIntegrity);
        
        // Reduce flooding
        ship.damageState.floodingRate = Math.max(0, ship.damageState.floodingRate - 0.5);
        break;
      
      case 'rigging':
        repairAmount = 15 * repairEfficiency;
        ship.damageState.rigDamage = Math.max(0, ship.damageState.rigDamage - repairAmount);
        break;
      
      case 'mast':
        repairAmount = 12 * repairEfficiency;
        // Repair the most damaged mast
        if (ship.damageState.masts.fore <= ship.damageState.masts.main && 
            ship.damageState.masts.fore <= ship.damageState.masts.mizzen) {
          ship.damageState.masts.fore = Math.min(100, ship.damageState.masts.fore + repairAmount);
        } else if (ship.damageState.masts.main <= ship.damageState.masts.mizzen) {
          ship.damageState.masts.main = Math.min(100, ship.damageState.masts.main + repairAmount);
        } else {
          ship.damageState.masts.mizzen = Math.min(100, ship.damageState.masts.mizzen + repairAmount);
        }
        break;
      
      case 'rudder':
        repairAmount = 20 * repairEfficiency;
        ship.damageState.rudderDamage = Math.max(0, ship.damageState.rudderDamage - repairAmount);
        break;
      
      case 'fire':
        if (ship.damageState.onFire) {
          ship.damageState.onFire = Math.random() > repairEfficiency;
        }
        break;
    }
    
    // Add repair event
    this.addEvent({
      type: 'repair',
      entityId: shipId,
      repairType,
      amount: repairAmount
    });
    
    // Return to idle after repair
    setTimeout(() => {
      if (ship && ship.status === 'repairing') {
        ship.status = 'idle';
      }
    }, 5000);
  }

  // Get a ship by ID
  getShipById(id: string): ShipEntity | undefined {
    const entity = this.state.entities.find(e => e.id === id);
    if (entity && entity.type === 'ship') {
      return entity as ShipEntity;
    }
    return undefined;
  }

  // Calculate distance between two positions
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Set course and speed for a ship
  setCourseAndSpeed(shipId: string, course: number, speed: number) {
    const ship = this.getShipById(shipId);
    if (!ship) return;
    
    // Update ship's rotation (course)
    ship.rotation = course;
    
    // For move events, we calculate the target based on course and speed
    const radians = (course - 90) * (Math.PI / 180); // Convert to radians, adjust for 0 being North
    const distanceFactor = speed / 10; // Distance to move based on speed
    
    // Calculate new target position
    const targetX = ship.position.x + Math.cos(radians) * distanceFactor;
    const targetY = ship.position.y + Math.sin(radians) * distanceFactor;
    
    // Create move event
    this.addEvent({
      type: 'entityMove',
      entityId: shipId,
      targetPosition: { 
        x: targetX, 
        y: targetY 
      },
      course,
      speed
    });
    
    // Update ship status
    if (speed > 0) {
      ship.status = 'moving';
      ship.targetPosition = { x: targetX, y: targetY };
    }
  }

  private processEvents() {
    while (this.state.eventQueue.length > 0) {
      const event = this.state.eventQueue.shift(); // FIFO event processing
      if (event) {
        this.handleEvent(event);
      }
    }
  }

  private handleEvent(event: GameEvent) {
    switch (event.type) {
      case 'entityMove': {
        const entity = this.state.entities.find(e => e.id === event.entityId);
        if (entity) {
          entity.status = 'moving';
          entity.targetPosition = event.targetPosition;
          
          // If this is a ship, update its speed
          if (entity.type === 'ship' && 'course' in event && 'speed' in event) {
            const ship = entity as ShipEntity;
            ship.currentSpeed = event.speed || 0;
          }
        }
        break;
      }
      
      case 'combatStart': {
        const entity = this.state.entities.find(e => e.id === event.entityId);
        if (entity) {
          entity.status = 'combat';
        }
        break;
      }
      
      case 'combatEnd': {
        const entity = this.state.entities.find(e => e.id === event.entityId);
        if (entity) {
          entity.status = 'idle';
        }
        break;
      }
      
      case 'cannonFire': {
        // Visual effects and sound handled by the UI
        console.log(`Cannon fire from ${event.entityId} targeting ${event.targetId}`);
        break;
      }
      
      case 'weatherChange': {
        if ('newWeather' in event && event.newWeather) {
          console.log(`Weather changing to ${event.newWeather}`);
        }
        break;
      }
      
      case 'windChange': {
        if ('newWindDirection' in event || 'newWindSpeed' in event) {
          console.log(`Wind changing to direction ${event.newWindDirection}, speed ${event.newWindSpeed}`);
        }
        break;
      }
      
      case 'shipDamage': {
        if ('damageType' in event) {
          console.log(`Ship ${event.entityId} took ${event.amount} damage to ${event.damageType}`);
        }
        break;
      }
      
      case 'boardingStart': {
        if ('attackerId' in event && 'defenderId' in event) {
          console.log(`Boarding action: ${event.attackerId} is boarding ${event.defenderId}`);
        }
        break;
      }
      
      case 'boardingResult': {
        if ('attackerId' in event && 'defenderId' in event && 'result' in event) {
          console.log(`Boarding result: ${event.result}`);
        }
        break;
      }
      
      case 'repair': {
        if ('entityId' in event && 'repairType' in event) {
          console.log(`Ship ${event.entityId} is repairing ${event.repairType}`);
        }
        break;
      }
      
      case 'turnStart': {
        if ('teamId' in event && 'turnNumber' in event) {
          console.log(`Turn ${event.turnNumber} started for team ${event.teamId}`);
          this.state.activeTeamId = event.teamId;
        }
        break;
      }
      
      case 'turnEnd': {
        if ('teamId' in event) {
          console.log(`Turn ended for team ${event.teamId}`);
          this.state.activeTeamId = undefined;
        }
        break;
      }
    }
  }

  private update(deltaTime: number) {
    this.state.deltaTime = deltaTime;
    
    // Apply time scaling
    const scaledDelta = deltaTime * this.state.timeScale;
    
    // Process events
    this.processEvents();
    
    // Update weather occasionally
    this.weatherUpdateTimer += scaledDelta;
    if (this.weatherUpdateTimer >= this.weatherUpdateInterval) {
      this.updateWeather();
      this.weatherUpdateTimer = 0;
    }
    
    // Fixed timestep update loop
    this.accumulator += scaledDelta;
    
    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }
    
    // Notify subscribers (render update) - should be after fixed update
    this.callbacks.forEach((callback) => callback(this.state));
  }

  private updateWeather() {
    // Random chance to change weather
    if (Math.random() > 0.7) {
      const weatherTypes: Weather[] = ['clear', 'cloudy', 'rain', 'heavyRain', 'storm', 'fog'];
      const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      
      // Don't always change to a new weather
      if (newWeather !== this.state.weather) {
        this.setWeather(newWeather);
      }
    }
    
    // Random chance to change wind
    if (Math.random() > 0.8) {
      // Wind direction changes gradually
      const directionChange = (Math.random() - 0.5) * 60; // ±30 degrees
      const newDirection = (this.state.windDirection + directionChange + 360) % 360;
      
      // Wind speed changes based on weather
      let maxWindChange = 2;
      let baseWind = 5;
      
      switch (this.state.weather) {
        case 'storm':
          maxWindChange = 5;
          baseWind = 15;
          break;
        case 'heavyRain':
          maxWindChange = 4;
          baseWind = 10;
          break;
        case 'rain':
          maxWindChange = 3;
          baseWind = 8;
          break;
        case 'fog':
          maxWindChange = 1;
          baseWind = 3;
          break;
      }
      
      const windChange = (Math.random() - 0.5) * maxWindChange;
      const newSpeed = Math.max(1, Math.min(20, this.state.windSpeed + windChange));
      
      this.setWindDirection(newDirection);
      this.setWindSpeed(newSpeed);
    }
  }

  private fixedUpdate(timeStep: number) {
    // For each ship entity in the game
    this.state.entities.forEach((entity) => {
      if (entity.type === 'ship') {
        const ship = entity as ShipEntity;
        
        // Apply damage over time effects
        this.applyShipStatusEffects(ship, timeStep);
        
        // Update cannon reload timers
        ship.cannons.forEach(cannon => {
          if (cannon.status === 'reloading') {
            cannon.currentReload -= timeStep;
            if (cannon.currentReload <= 0) {
              cannon.status = 'ready';
            }
          }
        });
        
        // Handle movement for moving ships
        if (ship.status === 'moving' && ship.targetPosition) {
          this.updateShipMovement(ship, timeStep);
        }
      }
    });
  }

  private applyShipStatusEffects(ship: ShipEntity, timeStep: number) {
    // Handle fire damage
    if (ship.damageState.onFire) {
      const fireDamage = timeStep * 5; // 5 damage per second
      ship.currentHealth -= fireDamage;
      ship.damageState.hullIntegrity -= fireDamage / ship.maxHealth * 100;
      
      // Fire has a chance to spread to rigging
      if (Math.random() > 0.95) {
        ship.damageState.rigDamage += timeStep * 10;
      }
    }
    
    // Handle flooding
    if (ship.damageState.floodingRate > 0) {
      const floodDamage = timeStep * ship.damageState.floodingRate;
      ship.currentHealth -= floodDamage;
      ship.damageState.hullIntegrity -= floodDamage / ship.maxHealth * 100;
    }
    
    // Check if ship is sinking
    if (ship.currentHealth <= 0 || ship.damageState.hullIntegrity <= 0) {
      ship.status = 'sinking';
      
      // Ship will sink and be removed after a delay
      if (Math.random() > 0.99) {
        this.removeEntity(ship.id);
      }
    }
  }

  private updateShipMovement(ship: ShipEntity, timeStep: number) {
    if (!ship.targetPosition) return;
    
    // Calculate basic movement
    const dx = ship.targetPosition.x - ship.position.x;
    const dy = ship.targetPosition.y - ship.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Get the actual speed based on various factors
    const actualSpeed = this.calculateShipSpeed(ship);
    const step = actualSpeed * timeStep;
    
    // If we've reached the target (or close enough)
    if (distance <= step) {
      ship.position = { ...ship.targetPosition };
      ship.status = 'idle';
      delete ship.targetPosition;
      return;
    }
    
    // Calculate direction vector
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    // Get base velocity
    let velX = dirX * step;
    let velY = dirY * step;
    
    // Apply weather effects to movement
    if (this.state.weather === 'storm') {
      // Add random drift in storms
      velX += (Math.random() - 0.5) * step * 0.3;
      velY += (Math.random() - 0.5) * step * 0.3;
    }
    
    // Apply rudder damage effect (reduces turning ability)
    if (ship.damageState.rudderDamage > 50) {
      const currentDirection = Math.atan2(ship.velocity.y, ship.velocity.x);
      const targetDirection = Math.atan2(dirY, dirX);
      
      // Limit turning rate based on rudder damage
      const maxTurn = (1 - ship.damageState.rudderDamage / 100) * Math.PI; // Up to 180 degrees
      const angleDiff = this.normalizeAngle(targetDirection - currentDirection);
      
      if (Math.abs(angleDiff) > maxTurn) {
        // Can't turn as sharply, maintain more of original course
        const actualTurn = Math.sign(angleDiff) * maxTurn;
        const newDirection = currentDirection + actualTurn;
        
        velX = Math.cos(newDirection) * step;
        velY = Math.sin(newDirection) * step;
      }
    }
    
    // Update ship position
    ship.position.x += velX;
    ship.position.y += velY;
    
    // Store velocity for future reference
    ship.velocity = { x: velX / timeStep, y: velY / timeStep };
    
    // Clamp to grid boundaries
    ship.position.x = Math.max(0, Math.min(ship.position.x, this.config.gridSize));
    ship.position.y = Math.max(0, Math.min(ship.position.y, this.config.gridSize));
  }

  private calculateShipSpeed(ship: ShipEntity): number {
    // Base speed from ship's current speed setting
    let speedFactor = ship.currentSpeed / ship.maxSpeed;
    
    // Apply sail configuration factor
    const sailFactor = this.calculateSailEfficiency(ship);
    
    // Apply wind factor
    const windFactor = this.calculateWindFactor(ship);
    
    // Apply damage factors
    const rigDamageFactor = 1 - (ship.damageState.rigDamage / 200); // 50% at max damage
    
    const mastDamage = (ship.damageState.masts.fore + 
                       ship.damageState.masts.main + 
                       ship.damageState.masts.mizzen) / 300; // Average mast health
    const mastFactor = 0.2 + (mastDamage * 0.8); // 20% min speed with no masts
    
    // Final calculation
    const finalSpeed = ship.maxSpeed * speedFactor * sailFactor * windFactor * rigDamageFactor * mastFactor;
    
    return Math.max(0.5, finalSpeed); // Minimum speed of 0.5 to prevent complete stalling
  }

  private calculateSailEfficiency(ship: ShipEntity): number {
    const { mainSails, topSails, jibs, spanker } = ship.sailConfiguration;
    
    // Weighted average of sail types
    return (mainSails * 0.5 + topSails * 0.2 + jibs * 0.2 + spanker * 0.1) / 100;
  }

  private calculateWindFactor(ship: ShipEntity): number {
    // Calculate relative wind angle to ship heading
    const relativeAngle = this.normalizeAngle(this.state.windDirection - ship.rotation) * (180 / Math.PI);
    
    // Wind effectiveness based on angle:
    // 0 degrees: directly against wind - min speed
    // 90/270 degrees: beam reach - max speed
    // 180 degrees: running with wind - good speed
    
    let angleFactor = 0;
    
    // Against the wind (poor speed)
    if (relativeAngle < 45 || relativeAngle > 315) {
      angleFactor = 0.3; // Minimal movement possible against the wind
    }
    // Close hauled (moderate speed)
    else if ((relativeAngle >= 45 && relativeAngle < 90) || 
             (relativeAngle > 270 && relativeAngle <= 315)) {
      angleFactor = 0.6;
    }
    // Beam reach (maximum speed)
    else if ((relativeAngle >= 90 && relativeAngle < 135) || 
             (relativeAngle > 225 && relativeAngle <= 270)) {
      angleFactor = 1.0;
    }
    // Broad reach (very good speed)
    else if ((relativeAngle >= 135 && relativeAngle < 180) || 
             (relativeAngle > 180 && relativeAngle <= 225)) {
      angleFactor = 0.9;
    }
    // Running (good speed)
    else { // relativeAngle === 180
      angleFactor = 0.8;
    }
    
    // Apply wind speed factor (stronger wind = faster)
    const windSpeedFactor = this.state.windSpeed / 10; // Normalized to 1.0 at 10 knots
    
    return angleFactor * windSpeedFactor;
  }

  // Normalize angle to range [-π, π]
  private normalizeAngle(angle: number): number {
    const twoPI = 2 * Math.PI;
    return ((angle % twoPI) + twoPI) % twoPI;
  }

  private gameLoop = () => {
    if (!this.state.isRunning) return;
    
    const now = performance.now();
    let deltaTime = (now - this.state.lastUpdate) / 1000; // Convert to seconds
    deltaTime = Math.min(deltaTime, 0.1); // Prevent spiral of death
    this.state.lastUpdate = now;
    
    this.update(deltaTime);
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  getState(): GameState {
    return { ...this.state };
  }
  
  // Create default ship presets
  createShipPreset(shipClass: ShipClass, position: Position, teamId: string, nation: string): string {
    let name = '';
    
    // Generate ship name based on nationality and class
    switch (nation) {
      case 'british':
        if (shipClass === 'FirstRate' || shipClass === 'SecondRate') {
          const britishShips = ['HMS Victory', 'HMS Royal Sovereign', 'HMS Britannia', 'HMS Temeraire'];
          name = britishShips[Math.floor(Math.random() * britishShips.length)];
        } else {
          const britishShips = ['HMS Indefatigable', 'HMS Bellerophon', 'HMS Agamemnon', 'HMS Surprise'];
          name = britishShips[Math.floor(Math.random() * britishShips.length)];
        }
        break;
      
      case 'french':
        if (shipClass === 'FirstRate' || shipClass === 'SecondRate') {
          const frenchShips = ['Bucentaure', 'Orient', 'Commerce de Marseille', 'Océan'];
          name = frenchShips[Math.floor(Math.random() * frenchShips.length)];
        } else {
          const frenchShips = ['Redoutable', 'Intrépide', 'Scipion', 'Formidable'];
          name = frenchShips[Math.floor(Math.random() * frenchShips.length)];
        }
        break;
      
      case 'spanish':
        if (shipClass === 'FirstRate' || shipClass === 'SecondRate') {
          const spanishShips = ['Santísima Trinidad', 'Santa Ana', 'Príncipe de Asturias', 'Rayo'];
          name = spanishShips[Math.floor(Math.random() * spanishShips.length)];
        } else {
          const spanishShips = ['San Justo', 'Monarca', 'Neptuno', 'San Agustín'];
          name = spanishShips[Math.floor(Math.random() * spanishShips.length)];
        }
        break;
      
      case 'american':
        if (shipClass === 'FirstRate' || shipClass === 'SecondRate') {
          const americanShips = ['USS Constitution', 'USS President', 'USS United States', 'USS Independence'];
          name = americanShips[Math.floor(Math.random() * americanShips.length)];
        } else {
          const americanShips = ['USS Constellation', 'USS Congress', 'USS Chesapeake', 'USS Essex'];
          name = americanShips[Math.floor(Math.random() * americanShips.length)];
        }
        break;
      
      case 'dutch':
        if (shipClass === 'FirstRate' || shipClass === 'SecondRate') {
          const dutchShips = ['Vrijheid', 'Zeven Provinciën', 'Batavier', 'Amsterdam'];
          name = dutchShips[Math.floor(Math.random() * dutchShips.length)];
        } else {
          const dutchShips = ['Delft', 'Utrecht', 'Gelderland', 'Cerberus'];
          name = dutchShips[Math.floor(Math.random() * dutchShips.length)];
        }
        break;
      
      default:
        name = `${shipClass} Ship`;
    }
    
    return this.createShip(position, shipClass, teamId, name, nation);
  }
}