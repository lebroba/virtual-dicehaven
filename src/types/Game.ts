
// Basic types for the naval warfare game

export type ShipClass = 
  'FirstRate' | 'SecondRate' | 'ThirdRate' | 'FourthRate' | 
  'FifthRate' | 'SixthRate' | 'Sloop' | 'Cutter' | 'Fireship';

export type ShipStatus = 'idle' | 'moving' | 'combat' | 'boarding' | 'sinking' | 'repairing';

export type AmmoType = 'roundshot' | 'chainshot' | 'grapeshot' | 'doubleshot' | 'hotshot';

export type Weather = 'clear' | 'rain' | 'storm' | 'fog' | 'heavyFog';

export type CannonStatus = 'ready' | 'reloading' | 'disabled';

export interface ShipCannon {
  location: 'port' | 'starboard' | 'bow' | 'stern';
  status: CannonStatus;
  reloadProgress: number;
  ammoType: AmmoType;
}

export interface ShipEntity {
  id: string;
  name: string;
  shipClass: ShipClass;
  nationality: string;
  teamId: string;
  position: {
    x: number;
    y: number;
  };
  rotation: number; // 0-359 degrees
  currentSpeed: number;
  maxSpeed: number;
  status: ShipStatus;
  damageState: {
    hullIntegrity: number; // 0-100
    rigDamage: number; // 0-100
    rudderDamage: number; // 0-100
    masts: {
      fore: number; // 0-100
      main: number; // 0-100
      mizzen: number; // 0-100
    };
    onFire: boolean;
    floodingRate: number;
    crewCasualties: number;
  };
  sailConfiguration: {
    currentConfig: 'full' | 'battle' | 'reduced' | 'minimal' | 'none';
    mainSails: number; // 0-100
    topSails: number; // 0-100
    jibs: number; // 0-100
    spanker: number; // 0-100
  };
  cannons: ShipCannon[];
  currentCrew: number;
  maxCrew: number;
  currentSupplies: number;
  maxSupplies: number;
  experienceLevel: number; // 1-5
  type: 'ship';
}
