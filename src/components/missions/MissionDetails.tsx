
import React, { useState } from 'react';
import { Mission } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Navigation,
  Anchor,
  Swords,
  Sun,
  Cloud,
  CloudRain,
  CloudFog,
  CloudLightning,
  Sunrise,
  Sun as DayIcon,
  Sunset,
  Moon,
  Mountain,
  Waves,
  Map,
  Snowflake,
  Palmtree,
  Target,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MissionDetailsProps {
  mission: Mission;
  onConfigureMission: (configuredMission: Mission) => void;
  onStartMission: (mission: Mission) => void;
}

const MissionDetails: React.FC<MissionDetailsProps> = ({
  mission,
  onConfigureMission,
  onStartMission
}) => {
  const [configuredMission, setConfiguredMission] = useState<Mission>(mission);
  
  const handleStartMission = () => {
    onStartMission(configuredMission);
  };
  
  const handleDifficultyChange = (value: number[]) => {
    const updatedMission = { ...configuredMission, difficulty: value[0] };
    setConfiguredMission(updatedMission);
    onConfigureMission(updatedMission);
  };
  
  const handleWeatherChange = (value: string) => {
    const updatedMission = { ...configuredMission, weather: value as any };
    setConfiguredMission(updatedMission);
    onConfigureMission(updatedMission);
  };
  
  const handleTimeChange = (value: string) => {
    const updatedMission = { ...configuredMission, time_of_day: value as any };
    setConfiguredMission(updatedMission);
    onConfigureMission(updatedMission);
  };
  
  const handleTerrainChange = (value: string) => {
    const updatedMission = { ...configuredMission, terrain: value as any };
    setConfiguredMission(updatedMission);
    onConfigureMission(updatedMission);
  };
  
  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'coastal_defense':
        return <Shield className="h-5 w-5 text-primary" />;
      case 'patrol':
        return <Navigation className="h-5 w-5 text-primary" />;
      case 'escort':
        return <Anchor className="h-5 w-5 text-primary" />;
      case 'combat':
        return <Swords className="h-5 w-5 text-primary" />;
      default:
        return <Shield className="h-5 w-5 text-primary" />;
    }
  };

  const getTerrainIcon = (terrain: string) => {
    switch (terrain) {
      case 'open_ocean':
        return <Waves className="h-4 w-4" />;
      case 'coastal_waters':
        return <Shield className="h-4 w-4" />;
      case 'archipelago':
        return <Map className="h-4 w-4" />;
      case 'arctic':
        return <Snowflake className="h-4 w-4" />;
      case 'tropical':
        return <Palmtree className="h-4 w-4" />;
      default:
        return <Mountain className="h-4 w-4" />;
    }
  };

  const getTerrainLabel = (terrain: string) => {
    switch (terrain) {
      case 'open_ocean':
        return 'Open Ocean';
      case 'coastal_waters':
        return 'Coastal Waters';
      case 'archipelago':
        return 'Archipelago';
      case 'arctic':
        return 'Arctic';
      case 'tropical':
        return 'Tropical';
      default:
        return terrain.replace('_', ' ');
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        {getMissionTypeIcon(configuredMission.type)}
        <h2 className="text-xl font-mono tracking-tight">{configuredMission.name}</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">{configuredMission.description}</p>
      
      <Separator className="mb-6" />
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2">
        {/* Objective */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-mono text-muted-foreground">OBJECTIVE</h3>
          </div>
          <p className="text-sm">{configuredMission.objective}</p>
        </div>
        
        {/* Reward */}
        {configuredMission.reward && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-mono text-muted-foreground">REWARD</h3>
            </div>
            <p className="text-sm">{configuredMission.reward}</p>
          </div>
        )}
        
        <Separator />
        
        {/* Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-mono text-muted-foreground">MISSION PARAMETERS</h3>
          </div>
          
          {/* Difficulty */}
          <div className="space-y-2">
            <Label className="text-xs">Difficulty ({configuredMission.difficulty})</Label>
            <Slider 
              value={[configuredMission.difficulty]} 
              min={1} 
              max={5} 
              step={1} 
              onValueChange={handleDifficultyChange} 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimal</span>
              <span>Extreme</span>
            </div>
          </div>
          
          {/* Weather */}
          <div className="space-y-2">
            <Label className="text-xs">Weather Conditions</Label>
            <Select 
              value={configuredMission.weather} 
              onValueChange={handleWeatherChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select weather" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Clear</span>
                  </div>
                </SelectItem>
                <SelectItem value="cloudy">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    <span>Cloudy</span>
                  </div>
                </SelectItem>
                <SelectItem value="rainy">
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4" />
                    <span>Rainy</span>
                  </div>
                </SelectItem>
                <SelectItem value="foggy">
                  <div className="flex items-center gap-2">
                    <CloudFog className="h-4 w-4" />
                    <span>Foggy</span>
                  </div>
                </SelectItem>
                <SelectItem value="stormy">
                  <div className="flex items-center gap-2">
                    <CloudLightning className="h-4 w-4" />
                    <span>Stormy</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Time of Day */}
          <div className="space-y-2">
            <Label className="text-xs">Time of Day</Label>
            <Select 
              value={configuredMission.time_of_day} 
              onValueChange={handleTimeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dawn">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4" />
                    <span>Dawn</span>
                  </div>
                </SelectItem>
                <SelectItem value="day">
                  <div className="flex items-center gap-2">
                    <DayIcon className="h-4 w-4" />
                    <span>Day</span>
                  </div>
                </SelectItem>
                <SelectItem value="dusk">
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4" />
                    <span>Dusk</span>
                  </div>
                </SelectItem>
                <SelectItem value="night">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Night</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Terrain */}
          <div className="space-y-2">
            <Label className="text-xs">Terrain</Label>
            <Select 
              value={configuredMission.terrain} 
              onValueChange={handleTerrainChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select terrain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open_ocean">
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4" />
                    <span>Open Ocean</span>
                  </div>
                </SelectItem>
                <SelectItem value="coastal_waters">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Coastal Waters</span>
                  </div>
                </SelectItem>
                <SelectItem value="archipelago">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    <span>Archipelago</span>
                  </div>
                </SelectItem>
                <SelectItem value="arctic">
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4" />
                    <span>Arctic</span>
                  </div>
                </SelectItem>
                <SelectItem value="tropical">
                  <div className="flex items-center gap-2">
                    <Palmtree className="h-4 w-4" />
                    <span>Tropical</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Button 
          className="w-full font-mono" 
          onClick={handleStartMission}
        >
          START MISSION
        </Button>
      </div>
    </div>
  );
};

export default MissionDetails;
