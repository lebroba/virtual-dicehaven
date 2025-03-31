
import { Component, EntityId } from '../types';

/**
 * Ship component for naval entities
 */
export interface ShipComponent extends Component {
  type: 'ship';
  shipClass: 'FirstRate' | 'SecondRate' | 'ThirdRate' | 'FourthRate' | 'FifthRate' | 'SixthRate' | 'Sloop' | 'Cutter' | 'Fireship';
  hull: {
    current: number;
    max: number;
  };
  crew: {
    current: number;
    max: number;
  };
  supplies: {
    current: number;
    max: number;
  };
  cannons: {
    port: number;
    starboard: number;
    bow: number;
    stern: number;
  };
  sails: {
    mainSails: number; // 0-100%
    topSails: number; // 0-100%
    jibs: number; // 0-100%
    spanker: number; // 0-100%
    configuration: 'full' | 'battle' | 'reduced' | 'minimal' | 'none';
  };
  damage: {
    hull: number;
    rigging: number;
    rudder: number;
    masts: {
      fore: number;
      main: number;
      mizzen: number;
    };
    onFire: boolean;
    floodingRate: number;
  };
  speed: {
    current: number;
    max: number;
  };
  nationality: string;
  experienceLevel: number; // 1-5
  isAI: boolean;
}

/**
 * Create a ship component
 * @param entityId Entity ID
 * @param shipClass Ship class
 * @param nationality Ship nationality
 * @returns Ship component
 */
export function createShipComponent(
  entityId: EntityId,
  shipClass: ShipComponent['shipClass'] = 'Sloop',
  nationality: string = 'British',
  options: Partial<Pick<Component, 'priority' | 'lodLevel' | 'enabled'>> = {}
): ShipComponent {
  // Set default values based on ship class
  let hullMax = 100;
  let crewMax = 100;
  let suppliesMax = 100;
  let cannonsPort = 8;
  let cannonsStarboard = 8;
  let cannonsBow = 0;
  let cannonsStern = 2;
  let speedMax = 10;
  
  switch (shipClass) {
    case 'FirstRate':
      hullMax = 1000;
      crewMax = 850;
      suppliesMax = 500;
      cannonsPort = 50;
      cannonsStarboard = 50;
      cannonsBow = 4;
      cannonsStern = 6;
      speedMax = 6;
      break;
    case 'SecondRate':
      hullMax = 900;
      crewMax = 750;
      suppliesMax = 450;
      cannonsPort = 45;
      cannonsStarboard = 45;
      cannonsBow = 3;
      cannonsStern = 6;
      speedMax = 6.5;
      break;
    case 'ThirdRate':
      hullMax = 800;
      crewMax = 650;
      suppliesMax = 400;
      cannonsPort = 40;
      cannonsStarboard = 40;
      cannonsBow = 2;
      cannonsStern = 4;
      speedMax = 7;
      break;
    case 'FourthRate':
      hullMax = 600;
      crewMax = 420;
      suppliesMax = 300;
      cannonsPort = 30;
      cannonsStarboard = 30;
      cannonsBow = 2;
      cannonsStern = 3;
      speedMax = 8;
      break;
    case 'FifthRate':
      hullMax = 450;
      crewMax = 300;
      suppliesMax = 250;
      cannonsPort = 22;
      cannonsStarboard = 22;
      cannonsBow = 2;
      cannonsStern = 2;
      speedMax = 9;
      break;
    case 'SixthRate':
      hullMax = 350;
      crewMax = 240;
      suppliesMax = 200;
      cannonsPort = 14;
      cannonsStarboard = 14;
      cannonsBow = 1;
      cannonsStern = 2;
      speedMax = 10;
      break;
    case 'Sloop':
      hullMax = 250;
      crewMax = 120;
      suppliesMax = 150;
      cannonsPort = 8;
      cannonsStarboard = 8;
      cannonsBow = 1;
      cannonsStern = 1;
      speedMax = 12;
      break;
    case 'Cutter':
      hullMax = 150;
      crewMax = 60;
      suppliesMax = 80;
      cannonsPort = 5;
      cannonsStarboard = 5;
      cannonsBow = 1;
      cannonsStern = 1;
      speedMax = 14;
      break;
    case 'Fireship':
      hullMax = 200;
      crewMax = 40;
      suppliesMax = 40;
      cannonsPort = 0;
      cannonsStarboard = 0;
      cannonsBow = 0;
      cannonsStern = 0;
      speedMax = 8;
      break;
  }
  
  return {
    type: 'ship',
    entityId,
    shipClass,
    hull: {
      current: hullMax,
      max: hullMax
    },
    crew: {
      current: crewMax,
      max: crewMax
    },
    supplies: {
      current: suppliesMax,
      max: suppliesMax
    },
    cannons: {
      port: cannonsPort,
      starboard: cannonsStarboard,
      bow: cannonsBow,
      stern: cannonsStern
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
      max: speedMax
    },
    nationality,
    experienceLevel: 3, // Default to average experience
    isAI: false,
    priority: options.priority || 'medium',
    lodLevel: options.lodLevel || 'high',
    enabled: options.enabled !== undefined ? options.enabled : true
  };
}
