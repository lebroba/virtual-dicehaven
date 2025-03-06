
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, ShipSpecifications } from '@/types/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Anchor, Shield, Gauge, Ruler, Users, Bomb, FileBarChart, Database, Target, Radio } from 'lucide-react';
import ShipSystemControl from './ShipSystemControl';
import ShipModel from './ShipModel';

interface ShipDetailsProps {
  ship: Ship;
  onSelectShip: () => void;
  onToggleSystem: (type: 'systems' | 'sensors', index: number) => void;
}

const ShipDetails: React.FC<ShipDetailsProps> = ({ 
  ship, 
  onSelectShip,
  onToggleSystem
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const specs = ship.specifications as ShipSpecifications;

  const renderOverview = () => (
    <div className="space-y-4">
      <p className="text-sm">{ship.description}</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Anchor className="h-4 w-4 text-primary" />
            <span className="font-mono">Displacement:</span>
            <span className="ml-auto">{specs.displacement} tons</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Ruler className="h-4 w-4 text-primary" />
            <span className="font-mono">Length:</span>
            <span className="ml-auto">{specs.length} m</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Ruler className="h-4 w-4 text-primary" />
            <span className="font-mono">Beam:</span>
            <span className="ml-auto">{specs.beam} m</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Ruler className="h-4 w-4 text-primary" />
            <span className="font-mono">Draft:</span>
            <span className="ml-auto">{specs.draft} m</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="font-mono">Speed:</span>
            <span className="ml-auto">{specs.speed} knots</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Radio className="h-4 w-4 text-primary" />
            <span className="font-mono">Range:</span>
            <span className="ml-auto">{specs.range} nm</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-mono">Crew:</span>
            <span className="ml-auto">{specs.crew}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-mono">AEGIS:</span>
            <span className="ml-auto">Baseline {specs.aegisBaseline}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-mono">COMBAT RATINGS</h3>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono">FIREPOWER</span>
              <span className="font-mono">{specs.stats.firepower}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
              <div 
                className="h-full bg-primary rounded-sm" 
                style={{ width: `${specs.stats.firepower}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono">DEFENSE</span>
              <span className="font-mono">{specs.stats.defense}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
              <div 
                className="h-full bg-primary rounded-sm" 
                style={{ width: `${specs.stats.defense}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-mono">ANTI-AIR</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-sm" 
                  style={{ width: `${specs.stats.antiAir}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-mono">ANTI-SURFACE</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-sm" 
                  style={{ width: `${specs.stats.antiSurface}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-mono">ANTI-SUB</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-sm" 
                  style={{ width: `${specs.stats.antiSubmarine}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeapons = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-mono mb-2">VERTICAL LAUNCH SYSTEM</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="border border-muted rounded-md p-2 text-center bg-muted/10">
            <p className="text-xs text-muted-foreground font-mono">FORWARD</p>
            <p className="text-xl font-mono">{specs.vls.forwardCells}</p>
            <p className="text-[10px] text-muted-foreground font-mono">CELLS</p>
          </div>
          <div className="border border-primary rounded-md p-2 text-center bg-primary/5">
            <p className="text-xs text-primary font-mono">TOTAL</p>
            <p className="text-xl font-mono">{specs.vls.totalCells}</p>
            <p className="text-[10px] text-muted-foreground font-mono">CELLS</p>
          </div>
          <div className="border border-muted rounded-md p-2 text-center bg-muted/10">
            <p className="text-xs text-muted-foreground font-mono">AFT</p>
            <p className="text-xl font-mono">{specs.vls.aftCells}</p>
            <p className="text-[10px] text-muted-foreground font-mono">CELLS</p>
          </div>
        </div>
        
        <h4 className="text-xs font-mono text-muted-foreground mb-2">MISSILE LOADOUT</h4>
        <div className="space-y-2">
          {specs.vls.loadout.map((missile, index) => (
            <div key={index} className="flex justify-between items-center p-2 border border-muted rounded-md bg-background/60">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-mono">{missile.missileType}</span>
              </div>
              <span className="text-sm font-mono">{missile.count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-mono mb-2">WEAPON SYSTEMS</h3>
        <div className="space-y-2">
          {specs.weapons.map((weapon, index) => (
            <div key={index} className="flex justify-between items-center p-2 border border-muted rounded-md bg-background/60">
              <div>
                <p className="text-sm font-mono">{weapon.name}</p>
                <p className="text-xs text-muted-foreground">{weapon.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono">{weapon.count}x</p>
                {weapon.ammunition && (
                  <p className="text-xs text-muted-foreground font-mono">{weapon.ammunition} rounds</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none space-y-2 mb-4">
        <h2 className="text-2xl font-mono tracking-tight">{ship.name}</h2>
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {ship.class} Class &middot; {ship.nation}
          </p>
          <Button 
            variant="default" 
            size="sm"
            onClick={onSelectShip}
            className="font-mono text-xs"
          >
            SELECT VESSEL
          </Button>
        </div>
      </div>
      
      <div className="relative h-48 mb-4 bg-muted/20 rounded-md overflow-hidden border border-muted">
        <ShipModel modelUrl={ship.model_url} />
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="overview" className="text-xs font-mono">
            <FileBarChart className="h-3 w-3 mr-1" /> 
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger value="weapons" className="text-xs font-mono">
            <Bomb className="h-3 w-3 mr-1" /> 
            WEAPONS
          </TabsTrigger>
          <TabsTrigger value="systems" className="text-xs font-mono">
            <Database className="h-3 w-3 mr-1" /> 
            SYSTEMS
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="m-0 p-2">
            {renderOverview()}
          </TabsContent>
          <TabsContent value="weapons" className="m-0 p-2">
            {renderWeapons()}
          </TabsContent>
          <TabsContent value="systems" className="m-0 p-2">
            <ShipSystemControl 
              specifications={specs} 
              onToggleSystem={onToggleSystem}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default ShipDetails;
