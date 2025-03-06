
import { supabase } from './supabase';
import { Ship, ShipSpecifications } from '@/types/supabase';

// Initialize sample ship data if none exists
export const initializeShips = async () => {
  const { data: existingShips } = await supabase
    .from('ships')
    .select('id')
    .limit(1);

  if (existingShips && existingShips.length > 0) {
    console.log('Ships already initialized');
    return;
  }

  const sampleShips = [
    {
      id: 'ddg-51',
      name: 'USS Arleigh Burke',
      class: 'Arleigh Burke',
      type: 'Guided Missile Destroyer',
      nation: 'United States',
      description: 'AEGIS Baseline 5.4 destroyer focused on ballistic missile defense and anti-submarine warfare.',
      image_url: '/assets/ddg51.jpg',
      model_url: '/models/ddg51.glb',
      specifications: {
        displacement: 8315,
        length: 154,
        beam: 20,
        draft: 9.3,
        speed: 30,
        range: 4400,
        crew: 281,
        aegisBaseline: '5.4',
        systems: [
          {
            name: 'AEGIS Combat System',
            type: 'command',
            status: 'operational',
            canToggle: true,
            isActive: true,
            description: 'Baseline 5.4 with limited BMD capability'
          },
          {
            name: 'SQQ-89 ASW Suite',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            description: 'Integrated anti-submarine warfare system'
          },
          {
            name: 'SEWIP Block 2',
            type: 'electronic_warfare',
            status: 'operational',
            canToggle: true,
            isActive: false,
            description: 'Surface Electronic Warfare Improvement Program'
          }
        ],
        weapons: [
          {
            name: 'Mk 45 5-inch Gun',
            type: 'naval_gun',
            count: 1,
            status: 'operational',
            ammunition: 600,
            description: '5-inch/54-caliber naval gun system'
          },
          {
            name: 'Mk 15 CIWS',
            type: 'point_defense',
            count: 2,
            status: 'operational',
            ammunition: 1550,
            description: 'Close-In Weapon System for missile defense'
          },
          {
            name: 'Mk 32 Torpedo Tubes',
            type: 'torpedo',
            count: 2,
            status: 'operational',
            ammunition: 24,
            description: 'Triple-tube launchers for Mk 46 torpedoes'
          }
        ],
        sensors: [
          {
            name: 'AN/SPY-1D',
            type: 'radar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            range: 250,
            description: 'Phased array radar system for AEGIS'
          },
          {
            name: 'AN/SQS-53C',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            range: 40,
            description: 'Hull-mounted sonar system'
          },
          {
            name: 'AN/SQR-19',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: false,
            range: 100,
            description: 'Tactical Towed Array Sonar'
          }
        ],
        vls: {
          totalCells: 90,
          forwardCells: 29,
          aftCells: 61,
          loadout: [
            {
              missileType: 'SM-2',
              count: 32
            },
            {
              missileType: 'SM-3',
              count: 12
            },
            {
              missileType: 'ESSM',
              count: 24
            },
            {
              missileType: 'Tomahawk',
              count: 16
            },
            {
              missileType: 'VL-ASROC',
              count: 6
            }
          ]
        },
        stats: {
          firepower: 75,
          defense: 70,
          speed: 80,
          range: 65,
          antiAir: 80,
          antiSurface: 70,
          antiSubmarine: 65
        }
      }
    },
    {
      id: 'ddg-95',
      name: 'USS James E. Williams',
      class: 'Arleigh Burke',
      type: 'Guided Missile Destroyer',
      nation: 'United States',
      description: 'AEGIS Baseline 7.0 destroyer with improved air defense capabilities.',
      image_url: '/assets/ddg95.jpg',
      model_url: '/models/ddg95.glb',
      specifications: {
        displacement: 9200,
        length: 155,
        beam: 20,
        draft: 9.4,
        speed: 31,
        range: 4500,
        crew: 276,
        aegisBaseline: '7.0',
        systems: [
          {
            name: 'AEGIS Combat System',
            type: 'command',
            status: 'operational',
            canToggle: true,
            isActive: true,
            description: 'Baseline 7.0 with improved air defense capabilities'
          },
          {
            name: 'SQQ-89A(V)15',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            description: 'Advanced integrated anti-submarine warfare system'
          },
          {
            name: 'SEWIP Block 3',
            type: 'electronic_warfare',
            status: 'operational',
            canToggle: true,
            isActive: false,
            description: 'Advanced electronic warfare suite'
          }
        ],
        weapons: [
          {
            name: 'Mk 45 5-inch Gun',
            type: 'naval_gun',
            count: 1,
            status: 'operational',
            ammunition: 600,
            description: '5-inch/62-caliber naval gun system'
          },
          {
            name: 'Mk 15 CIWS',
            type: 'point_defense',
            count: 2,
            status: 'operational',
            ammunition: 1550,
            description: 'Block 1B Close-In Weapon System'
          },
          {
            name: 'Mk 32 Torpedo Tubes',
            type: 'torpedo',
            count: 2,
            status: 'operational',
            ammunition: 24,
            description: 'Triple-tube launchers for Mk 54 torpedoes'
          }
        ],
        sensors: [
          {
            name: 'AN/SPY-1D(V)',
            type: 'radar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            range: 280,
            description: 'Enhanced phased array radar system'
          },
          {
            name: 'AN/SQS-53C(V)2',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            range: 45,
            description: 'Upgraded hull-mounted sonar system'
          },
          {
            name: 'AN/SQR-19 TACTASS',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: false,
            range: 120,
            description: 'Improved Tactical Towed Array Sonar'
          }
        ],
        vls: {
          totalCells: 96,
          forwardCells: 32,
          aftCells: 64,
          loadout: [
            {
              missileType: 'SM-2',
              count: 32
            },
            {
              missileType: 'SM-3',
              count: 16
            },
            {
              missileType: 'ESSM',
              count: 24
            },
            {
              missileType: 'Tomahawk',
              count: 18
            },
            {
              missileType: 'VL-ASROC',
              count: 6
            }
          ]
        },
        stats: {
          firepower: 80,
          defense: 75,
          speed: 85,
          range: 70,
          antiAir: 85,
          antiSurface: 75,
          antiSubmarine: 70
        }
      }
    },
    {
      id: 'ddg-115',
      name: 'USS Rafael Peralta',
      class: 'Arleigh Burke',
      type: 'Guided Missile Destroyer',
      nation: 'United States',
      description: 'AEGIS Baseline 9.x destroyer with full integrated air and missile defense (IAMD) capabilities.',
      image_url: '/assets/ddg115.jpg',
      model_url: '/models/ddg115.glb',
      specifications: {
        displacement: 9500,
        length: 155,
        beam: 20,
        draft: 9.4,
        speed: 31,
        range: 4500,
        crew: 314,
        aegisBaseline: '9.x',
        systems: [
          {
            name: 'AEGIS Combat System',
            type: 'command',
            status: 'operational',
            canToggle: true,
            isActive: true,
            description: 'Baseline 9.x with simultaneous air defense and BMD capability'
          },
          {
            name: 'SQQ-89A(V)15',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            description: 'Advanced integrated anti-submarine warfare system'
          },
          {
            name: 'SEWIP Block 3',
            type: 'electronic_warfare',
            status: 'operational',
            canToggle: true,
            isActive: false,
            description: 'Advanced electronic warfare suite with offensive capabilities'
          },
          {
            name: 'Cooperative Engagement Capability',
            type: 'networking',
            status: 'operational',
            canToggle: true,
            isActive: true,
            description: 'Advanced sensor netting capability'
          }
        ],
        weapons: [
          {
            name: 'Mk 45 5-inch Gun',
            type: 'naval_gun',
            count: 1,
            status: 'operational',
            ammunition: 600,
            description: '5-inch/62-caliber naval gun system'
          },
          {
            name: 'Mk 15 CIWS',
            type: 'point_defense',
            count: 2,
            status: 'operational',
            ammunition: 1550,
            description: 'Block 1B Close-In Weapon System'
          },
          {
            name: 'Mk 32 Torpedo Tubes',
            type: 'torpedo',
            count: 2,
            status: 'operational',
            ammunition: 24,
            description: 'Triple-tube launchers for Mk 54 torpedoes'
          },
          {
            name: 'SeaRAM',
            type: 'point_defense',
            count: 1,
            status: 'operational',
            ammunition: 11,
            description: 'Surface-to-air missile system for close-in defense'
          }
        ],
        sensors: [
          {
            name: 'AN/SPY-1D(V)',
            type: 'radar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            range: 300,
            description: 'Advanced phased array radar system'
          },
          {
            name: 'AN/SPQ-9B',
            type: 'radar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            range: 100,
            description: 'Surface search and fire control radar'
          },
          {
            name: 'AN/SQS-53C(V)2',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: true,
            range: 50,
            description: 'Advanced hull-mounted sonar system'
          },
          {
            name: 'AN/SQR-20 MFTA',
            type: 'sonar',
            status: 'operational',
            canToggle: true,
            isActive: false,
            range: 150,
            description: 'Multi-Function Towed Array Sonar'
          }
        ],
        vls: {
          totalCells: 96,
          forwardCells: 32,
          aftCells: 64,
          loadout: [
            {
              missileType: 'SM-2',
              count: 32
            },
            {
              missileType: 'SM-3',
              count: 16
            },
            {
              missileType: 'SM-6',
              count: 8
            },
            {
              missileType: 'ESSM',
              count: 16
            },
            {
              missileType: 'Tomahawk',
              count: 18
            },
            {
              missileType: 'VL-ASROC',
              count: 6
            }
          ]
        },
        stats: {
          firepower: 90,
          defense: 95,
          speed: 85,
          range: 70,
          antiAir: 95,
          antiSurface: 85,
          antiSubmarine: 80
        }
      }
    }
  ];

  for (const ship of sampleShips) {
    await supabase.from('ships').insert(ship);
  }

  console.log('Ships initialized successfully');
};

// Get all ships
export const getShips = async (): Promise<Ship[]> => {
  const { data, error } = await supabase
    .from('ships')
    .select('*');

  if (error) {
    console.error('Error fetching ships:', error);
    return [];
  }

  return data || [];
};

// Get ship by ID
export const getShipById = async (id: string): Promise<Ship | null> => {
  const { data, error } = await supabase
    .from('ships')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching ship:', error);
    return null;
  }

  return data;
};

// Toggle ship system/sensor
export const toggleShipSystem = async (
  shipId: string, 
  systemType: 'systems' | 'sensors', 
  systemIndex: number
): Promise<Ship | null> => {
  // First get the current ship
  const ship = await getShipById(shipId);
  if (!ship) return null;

  const specifications = ship.specifications as ShipSpecifications;
  const systems = specifications[systemType];
  
  if (systems && systems[systemIndex] && systems[systemIndex].canToggle) {
    systems[systemIndex].isActive = !systems[systemIndex].isActive;
    
    // Update the ship
    const { data, error } = await supabase
      .from('ships')
      .update({ specifications })
      .eq('id', shipId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating ship:', error);
      return null;
    }
    
    return data;
  }
  
  return ship;
};
