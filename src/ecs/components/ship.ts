
import { EntityId, ShipComponent } from '../types';

/**
 * Create a ship component
 */
export function createShipComponent(
  entityId: EntityId,
  shipClass: 'FirstRate' | 'SecondRate' | 'ThirdRate' | 'FourthRate' | 'FifthRate' | 'SixthRate' | 'Sloop' | 'Cutter' | 'Fireship',
  nationality: string
): ShipComponent {
  return {
    type: 'ship',
    entityId,
    shipClass,
    hull: {
      current: 100,
      max: 100
    },
    crew: {
      current: 100,
      max: 100
    },
    supplies: {
      current: 100,
      max: 100
    },
    cannons: {
      port: 20,
      starboard: 20,
      bow: 2,
      stern: 2
    },
    sails: {
      mainSails: 100,
      topSails: 100,
      jibs: 100,
      spanker: 100,
      configuration: 'full'
    },
    damage: {
      hull: 0,
      rigging: 0,
      rudder: 0,
      masts: {
        fore: 0,
        main: 0,
        mizzen: 0
      },
      onFire: false,
      floodingRate: 0
    },
    speed: {
      current: 0,
      max: 10
    },
    nationality,
    experienceLevel: 1,
    isAI: false,
    priority: 'high',
    lodLevel: 'high',
    enabled: true
  };
}
