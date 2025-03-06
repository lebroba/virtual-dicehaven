
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ship, ShipSpecifications } from '@/types/supabase';

interface ShipCardProps {
  ship: Ship;
  onClick: () => void;
  selected: boolean;
}

const ShipCard: React.FC<ShipCardProps> = ({ ship, onClick, selected }) => {
  const specs = ship.specifications as ShipSpecifications;
  
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
            <CardTitle className="text-md font-mono tracking-tight">{ship.name}</CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {ship.class} Class &middot; AEGIS BL {specs.aegisBaseline}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {ship.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-mono uppercase">Firepower</p>
            <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
              <div 
                className="h-full bg-primary rounded-sm" 
                style={{ width: `${specs.stats.firepower}%` }}
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-mono uppercase">Defense</p>
            <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
              <div 
                className="h-full bg-primary rounded-sm" 
                style={{ width: `${specs.stats.defense}%` }}
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-mono uppercase">Speed</p>
            <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
              <div 
                className="h-full bg-primary rounded-sm" 
                style={{ width: `${specs.stats.speed}%` }}
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-mono uppercase">Range</p>
            <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
              <div 
                className="h-full bg-primary rounded-sm" 
                style={{ width: `${specs.stats.range}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground font-mono">
            VLS: {specs.vls.totalCells} cells
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            CREW: {specs.crew}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ShipCard;
