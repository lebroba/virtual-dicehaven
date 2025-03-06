
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mission } from '@/types/supabase';
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
  Moon
} from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
  onClick: () => void;
  selected: boolean;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick, selected }) => {
  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'coastal_defense':
        return <Shield className="h-4 w-4" />;
      case 'patrol':
        return <Navigation className="h-4 w-4" />;
      case 'escort':
        return <Anchor className="h-4 w-4" />;
      case 'combat':
        return <Swords className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'clear':
        return <Sun className="h-4 w-4" />;
      case 'cloudy':
        return <Cloud className="h-4 w-4" />;
      case 'rainy':
        return <CloudRain className="h-4 w-4" />;
      case 'foggy':
        return <CloudFog className="h-4 w-4" />;
      case 'stormy':
        return <CloudLightning className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'dawn':
        return <Sunrise className="h-4 w-4" />;
      case 'day':
        return <DayIcon className="h-4 w-4" />;
      case 'dusk':
        return <Sunset className="h-4 w-4" />;
      case 'night':
        return <Moon className="h-4 w-4" />;
      default:
        return <DayIcon className="h-4 w-4" />;
    }
  };

  const getMissionTypeLabel = (type: string) => {
    switch (type) {
      case 'coastal_defense':
        return 'COASTAL DEFENSE';
      case 'patrol':
        return 'PATROL';
      case 'escort':
        return 'ESCORT';
      case 'combat':
        return 'COMBAT';
      default:
        return type.toUpperCase();
    }
  };
  
  return (
    <Card 
      className={`w-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
        selected ? 'border-primary bg-primary/10' : 'border-muted bg-muted/20'
      }`}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md font-mono tracking-tight">{mission.name}</CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {getMissionTypeLabel(mission.type)}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs flex items-center gap-1">
            {getMissionTypeIcon(mission.type)}
            <span>LVL {mission.difficulty}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {mission.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getWeatherIcon(mission.weather)}
            <span className="text-xs text-muted-foreground font-mono">
              {mission.weather.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getTimeIcon(mission.time_of_day)}
            <span className="text-xs text-muted-foreground font-mono">
              {mission.time_of_day.toUpperCase()}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MissionCard;
