
import { supabase } from './supabase';
import { Mission, MissionType, WeatherCondition, TimeOfDay, TerrainType } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

// Get all missions
export const getMissions = async (): Promise<Mission[]> => {
  const { data, error } = await supabase.from('missions').select('*');
  
  if (error) {
    console.error('Error fetching missions:', error);
    throw error;
  }
  
  return data || [];
};

// Get missions by type
export const getMissionsByType = async (type: MissionType): Promise<Mission[]> => {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('type', type);
  
  if (error) {
    console.error(`Error fetching ${type} missions:`, error);
    throw error;
  }
  
  return data || [];
};

// Get mission by ID
export const getMissionById = async (id: string): Promise<Mission | null> => {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching mission:', error);
    throw error;
  }
  
  return data;
};

// Update mission configuration
export const updateMissionConfig = async (
  id: string,
  config: {
    difficulty?: number;
    weather?: WeatherCondition;
    time_of_day?: TimeOfDay;
    terrain?: TerrainType;
  }
): Promise<Mission | null> => {
  const { data, error } = await supabase
    .from('missions')
    .update(config)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating mission configuration:', error);
    throw error;
  }
  
  return data;
};

// Initialize missions table with sample data
export const initializeMissions = async (): Promise<void> => {
  const { count, error: countError } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('Error checking missions count:', countError);
    throw countError;
  }
  
  // Only initialize if no missions exist
  if (count && count > 0) {
    console.log('Missions already exist in the database');
    return;
  }
  
  const sampleMissions = [
    {
      id: uuidv4(),
      name: 'Coastal Guardian',
      type: 'coastal_defense' as MissionType,
      description: 'Protect the coastline from hostile vessels attempting to breach defensive perimeters. Maintain vigilance against air and surface threats.',
      image_url: '/assets/tactical-grid.svg',
      difficulty: 2,
      weather: 'clear' as WeatherCondition,
      time_of_day: 'day' as TimeOfDay,
      terrain: 'coastal_waters' as TerrainType,
      objective: 'Patrol designated area and neutralize any threats to the coastline.',
      reward: 'Enhanced defensive systems',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Maritime Surveillance',
      type: 'patrol' as MissionType,
      description: 'Conduct routine patrol of strategic waterways. Monitor shipping lanes and identify suspicious vessels.',
      image_url: '/assets/tactical-grid.svg',
      difficulty: 1,
      weather: 'cloudy' as WeatherCondition,
      time_of_day: 'day' as TimeOfDay,
      terrain: 'open_ocean' as TerrainType,
      objective: 'Complete patrol route and identify all vessels in the area.',
      reward: 'Advanced radar systems',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Convoy Protection',
      type: 'escort' as MissionType,
      description: 'Provide escort for high-value convoy transporting strategic materials. Protect against surface and subsurface threats.',
      image_url: '/assets/tactical-grid.svg',
      difficulty: 3,
      weather: 'rainy' as WeatherCondition,
      time_of_day: 'dusk' as TimeOfDay,
      terrain: 'archipelago' as TerrainType,
      objective: 'Ensure convoy reaches destination safely without any losses.',
      reward: 'Enhanced sonar capabilities',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Operation Thunderstrike',
      type: 'combat' as MissionType,
      description: 'Engage and neutralize hostile naval force threatening allied shipping lanes. Expect heavy resistance.',
      image_url: '/assets/tactical-grid.svg',
      difficulty: 4,
      weather: 'stormy' as WeatherCondition,
      time_of_day: 'night' as TimeOfDay,
      terrain: 'open_ocean' as TerrainType,
      objective: 'Neutralize all hostile vessels and secure the area.',
      reward: 'Advanced missile systems',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Arctic Sentinel',
      type: 'patrol' as MissionType,
      description: 'Patrol contested arctic waters to maintain presence and gather intelligence on adversary activities.',
      image_url: '/assets/tactical-grid.svg',
      difficulty: 3,
      weather: 'foggy' as WeatherCondition,
      time_of_day: 'dawn' as TimeOfDay,
      terrain: 'arctic' as TerrainType,
      objective: 'Complete patrol route and document all adversary activities.',
      reward: 'Cold weather operations upgrade',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Island Defense',
      type: 'coastal_defense' as MissionType,
      description: 'Defend strategic island base from imminent attack. Multiple threats expected from air, surface, and subsurface.',
      image_url: '/assets/tactical-grid.svg',
      difficulty: 4,
      weather: 'clear' as WeatherCondition,
      time_of_day: 'day' as TimeOfDay,
      terrain: 'tropical' as TerrainType,
      objective: 'Repel all attacks and maintain control of the island.',
      reward: 'Island base construction rights',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'VIP Transport',
      type: 'escort' as MissionType,
      description: 'Escort diplomatic vessel carrying high-ranking officials through contested waters. Mission is highly sensitive.',
      image_url: '/assets/tactical-grid.svg',
      difficulty: 3,
      weather: 'clear' as WeatherCondition,
      time_of_day: 'night' as TimeOfDay,
      terrain: 'coastal_waters' as TerrainType,
      objective: 'Ensure VIP vessel reaches destination safely and covertly.',
      reward: 'Diplomatic influence',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Strike Force',
      type: 'combat' as MissionType,
      description: 'Lead naval strike group to eliminate hostile naval base. Coordinated attack with air and submarine assets.',
      image_url: '/assets/tactical-grid.svg',
      difficulty: 5,
      weather: 'stormy' as WeatherCondition,
      time_of_day: 'night' as TimeOfDay,
      terrain: 'archipelago' as TerrainType,
      objective: 'Destroy all designated targets and neutralize enemy response.',
      reward: 'Advanced weapons systems',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  
  const { error } = await supabase.from('missions').insert(sampleMissions);
  
  if (error) {
    console.error('Error initializing missions:', error);
    throw error;
  }
  
  console.log('Missions initialized successfully');
};
