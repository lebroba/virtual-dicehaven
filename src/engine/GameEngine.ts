// Fix the game state type
import { EventSystem } from "../src/ecs/EventSystem";

// Fix the GameState interface if needed
interface GameState {
  turn: number; // Add this property
}

// Fix the ShipEntity interface
interface ShipEntity {
  visibilityRange: number; // Add this property
}

interface WeatherEvent {
  type: string;
  previousWeather: any;
  newWeather: any;
  time: number;
  data: {
    newWindDirection?: number;
    newWindSpeed?: number;
  };
}

interface CombatEvent {
  type: string;
  attacker: string;
  defender: string;
  time: number;
  data: {
    side: "port" | "starboard" | "bow" | "stern";
    ammunition: number;
  };
}

interface DamageEvent {
  type: string;
  shipId: string;
  location: "hull" | "mast" | "rigging" | "crew" | "rudder";
  time: number;
  data: {
    amount: number;
    isCritical: boolean;
  };
}

interface GameEvent {
  type: string;
  time: number;
  data: any;
}

export class GameEngine {
  private gameState: GameState;
  private ships: any[];
  private weather: any;
  private eventBus: EventSystem;

  constructor() {
    this.gameState = {
      turn: 0,
    };
    this.ships = [];
    this.weather = {};
    this.eventBus = new EventSystem();
  }

  updateWindDirection(direction: number): void {
    this.weather.windDirection = direction;

    this.eventBus.dispatchEvent({
      type: "windChange", 
      previousWeather: this.weather,
      newWeather: this.weather,
      time: Date.now(),
      data: { newWindDirection: direction }
    } as WeatherEvent);
  }

  updateWindSpeed(speed: number): void {
    this.weather.windSpeed = speed;

    this.eventBus.dispatchEvent({
      type: "windChange",
      previousWeather: this.weather,
      newWeather: this.weather,
      time: Date.now(),
      data: { newWindSpeed: speed }
    } as WeatherEvent);
  }

  fireCannons(entityId: string, targetId: string, side: "port" | "starboard" | "bow" | "stern", ammunition: number): void {
    this.eventBus.dispatchEvent({
      type: "cannonFire",
      attacker: entityId,
      defender: targetId,
      time: Date.now(),
      data: { side, ammunition }
    } as CombatEvent);
  }

  damageShip(entityId: string, damageType: "hull" | "mast" | "rigging" | "crew" | "rudder", amount: number, isCritical: boolean): void {
    this.eventBus.dispatchEvent({
      type: "shipDamage",
      shipId: entityId,
      location: damageType,
      time: Date.now(),
      data: { amount, isCritical }
    } as DamageEvent);
  }

  boardingAction(attackerId: string, defenderId: string, result: "success" | "failure"): void {
    this.eventBus.dispatchEvent({
      type: "boarding",
      time: Date.now(),
      data: { attackerId, defenderId, result }
    });
  }

  grapplingAction(attackerId: string, defenderId: string, result: "success" | "failure"): void {
    this.eventBus.dispatchEvent({
      type: "grappling",
      time: Date.now(),
      data: { attackerId, defenderId, result }
    });
  }

  repairAction(entityId: string, repairType: "hull" | "mast" | "rigging" | "crew" | "rudder", amount: number): void {
    this.eventBus.dispatchEvent({
      type: "repair",
      time: Date.now(),
      data: { entityId, repairType, amount }
    });
  }

  setCourse(entityId: string, course: number): void {
    this.eventBus.dispatchEvent({
      type: "courseChange",
      time: Date.now(),
      data: { entityId, course }
    });
  }

  getShipPosition(entityId: string): { x: number, y: number } {
    const shipData = this.ships.find(ship => ship.id === entityId);

    // Add type assertions
    const x = shipData?.position?.x as number;
    const y = shipData?.position?.y as number;

    return { x, y };
  }

  getShipByName(name: string): any {
    // Add type assertions
    const ship = this.ships.find(s => s.name === name) as string;

    return ship;
  }
}
