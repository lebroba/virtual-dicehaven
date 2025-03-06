
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { ShipSpecifications } from '@/types/supabase';
import { Shield, Radar, Waves, Radio, Zap, AlertTriangle } from 'lucide-react';

interface SystemItemProps {
  name: string;
  type: string;
  status: 'operational' | 'offline' | 'damaged' | 'destroyed';
  canToggle: boolean;
  isActive: boolean;
  onToggle: () => void;
  description: string;
}

const SystemIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'radar':
      return <Radar className="h-4 w-4 text-primary" />;
    case 'sonar':
      return <Waves className="h-4 w-4 text-primary" />;
    case 'command':
      return <Shield className="h-4 w-4 text-primary" />;
    case 'electronic_warfare':
      return <Zap className="h-4 w-4 text-primary" />;
    case 'networking':
      return <Radio className="h-4 w-4 text-primary" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-primary" />;
  }
};

const SystemItem: React.FC<SystemItemProps> = ({
  name,
  type,
  status,
  canToggle,
  isActive,
  onToggle,
  description
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'operational':
        return isActive ? 'text-green-500' : 'text-gray-400';
      case 'offline':
        return 'text-gray-500';
      case 'damaged':
        return 'text-yellow-500';
      case 'destroyed':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border border-muted rounded-md bg-background/60">
      <div className="flex items-center gap-3">
        <SystemIcon type={type} />
        <div>
          <h4 className="text-sm font-medium font-mono">{name}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className={`text-xs font-mono ${getStatusColor()}`}>
          {status.toUpperCase()}
        </p>
        {canToggle && status === 'operational' && (
          <Switch 
            checked={isActive} 
            onCheckedChange={onToggle}
            disabled={status !== 'operational'}
          />
        )}
      </div>
    </div>
  );
};

interface ShipSystemControlProps {
  specifications: ShipSpecifications;
  onToggleSystem: (type: 'systems' | 'sensors', index: number) => void;
}

const ShipSystemControl: React.FC<ShipSystemControlProps> = ({
  specifications,
  onToggleSystem
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-mono text-muted-foreground mb-2">COMBAT SYSTEMS</h3>
        <div className="space-y-2">
          {specifications.systems.map((system, index) => (
            <SystemItem
              key={`system-${index}`}
              {...system}
              onToggle={() => onToggleSystem('systems', index)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-mono text-muted-foreground mb-2">SENSOR SYSTEMS</h3>
        <div className="space-y-2">
          {specifications.sensors.map((sensor, index) => (
            <SystemItem
              key={`sensor-${index}`}
              {...sensor}
              onToggle={() => onToggleSystem('sensors', index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipSystemControl;
