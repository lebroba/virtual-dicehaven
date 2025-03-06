
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, ShipSpecifications } from '@/types/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShipModel from './ShipModel';
import ShipSystemControl from './ShipSystemControl';
import { ShieldCheck, ArrowRight, GaugeCircle, Anchor, Users, FileBarChart } from 'lucide-react';

interface ShipDetailsProps {
  ship: Ship;
  onSelectShip: () => void;
  onToggleSystem: (type: 'systems' | 'sensors', index: number) => void;
}

const ShipDetails: React.FC<ShipDetailsProps> = ({ ship, onSelectShip, onToggleSystem }) => {
  const navigate = useNavigate();
  const specs = ship.specifications as ShipSpecifications;

  const handleSelectForMission = () => {
    navigate(`/mission-selection?shipId=${ship.id}`);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-mono tracking-tight flex items-center">
            <Anchor className="mr-2 h-5 w-5 text-primary" />
            {ship.name}
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            {ship.class} Class &middot; {ship.type} &middot; AEGIS BL {specs.aegisBaseline}
          </p>
        </div>
        <Badge variant="outline" className="font-mono uppercase">
          {ship.nation}
        </Badge>
      </div>
      
      <Separator className="my-4" />
      
      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="overview" className="text-xs">
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger value="systems" className="text-xs">
            SYSTEMS
          </TabsTrigger>
          <TabsTrigger value="weapons" className="text-xs">
            WEAPONS
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-xs">
            SPECIFICATIONS
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto mt-4">
          <TabsContent value="overview" className="h-full">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="glass-panel bg-muted/10 border border-border p-4 rounded-md h-full">
                <h3 className="text-sm font-mono text-muted-foreground mb-3">SHIP PROFILE</h3>
                <p className="text-sm mb-4">{ship.description}</p>
                
                <h4 className="text-xs font-mono text-muted-foreground mt-4 mb-2">COMBAT RATINGS</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">Firepower</p>
                    <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-sm" 
                        style={{ width: `${specs.stats.firepower}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">Defense</p>
                    <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-sm" 
                        style={{ width: `${specs.stats.defense}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">Speed</p>
                    <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-sm" 
                        style={{ width: `${specs.stats.speed}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">Range</p>
                    <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-sm" 
                        style={{ width: `${specs.stats.range}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">Anti-Air</p>
                    <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-sm" 
                        style={{ width: `${specs.stats.antiAir}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">Anti-Surface</p>
                    <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-sm" 
                        style={{ width: `${specs.stats.antiSurface}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="glass-panel border border-border rounded-md p-3 flex flex-col items-center">
                    <GaugeCircle className="h-4 w-4 text-primary mb-1" />
                    <span className="text-sm font-bold">{specs.speed}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">KNOTS</span>
                  </div>
                  <div className="glass-panel border border-border rounded-md p-3 flex flex-col items-center">
                    <Users className="h-4 w-4 text-primary mb-1" />
                    <span className="text-sm font-bold">{specs.crew}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">CREW</span>
                  </div>
                  <div className="glass-panel border border-border rounded-md p-3 flex flex-col items-center">
                    <FileBarChart className="h-4 w-4 text-primary mb-1" />
                    <span className="text-sm font-bold">{specs.vls.totalCells}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">VLS CELLS</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel bg-muted/10 border border-border p-4 rounded-md h-full">
                <h3 className="text-sm font-mono text-muted-foreground mb-3">SHIP MODEL</h3>
                <div className="flex-1 h-[calc(100%-2rem)] rounded-md overflow-hidden bg-background/60">
                  <ShipModel modelUrl={ship.model_url} />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="systems" className="h-full">
            <div className="glass-panel bg-muted/10 border border-border p-4 rounded-md h-full">
              <ShipSystemControl 
                specifications={specs} 
                onToggleSystem={onToggleSystem} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="weapons" className="h-full">
            <div className="glass-panel bg-muted/10 border border-border p-4 rounded-md h-full">
              <h3 className="text-sm font-mono text-muted-foreground mb-3">WEAPONS LOADOUT</h3>
              
              <div className="mb-4">
                <h4 className="text-xs font-mono text-muted-foreground mb-2">VLS CONFIGURATION</h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="glass-panel border border-border rounded-md p-3 flex flex-col items-center">
                    <span className="text-xs text-muted-foreground font-mono">FORWARD</span>
                    <span className="text-xl font-bold">{specs.vls.forwardCells}</span>
                    <span className="text-[10px] text-muted-foreground">CELLS</span>
                  </div>
                  <div className="glass-panel border border-border rounded-md p-3 flex flex-col items-center">
                    <span className="text-xs text-muted-foreground font-mono">AFT</span>
                    <span className="text-xl font-bold">{specs.vls.aftCells}</span>
                    <span className="text-[10px] text-muted-foreground">CELLS</span>
                  </div>
                  <div className="glass-panel border border-border rounded-md p-3 flex flex-col items-center">
                    <span className="text-xs text-muted-foreground font-mono">TOTAL</span>
                    <span className="text-xl font-bold">{specs.vls.totalCells}</span>
                    <span className="text-[10px] text-muted-foreground">CELLS</span>
                  </div>
                </div>
                
                <h4 className="text-xs font-mono text-muted-foreground mb-2">LOADOUT</h4>
                <div className="space-y-2">
                  {specs.vls.loadout.map((missile, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border border-muted rounded-md bg-background/60">
                      <span className="text-sm font-mono">{missile.missileType}</span>
                      <span className="text-sm font-mono">{missile.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <h4 className="text-xs font-mono text-muted-foreground mb-2">WEAPON SYSTEMS</h4>
              <div className="space-y-2">
                {specs.weapons.map((weapon, index) => (
                  <div key={index} className="p-2 border border-muted rounded-md bg-background/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-medium font-mono">{weapon.name}</h5>
                        <p className="text-xs text-muted-foreground">{weapon.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          x{weapon.count}
                        </Badge>
                        <p className={`text-xs font-mono ${
                          weapon.status === 'operational' ? 'text-green-500' : 
                          weapon.status === 'damaged' ? 'text-yellow-500' : 
                          weapon.status === 'offline' ? 'text-gray-500' : 
                          'text-red-500'
                        }`}>
                          {weapon.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {weapon.ammunition !== undefined && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground font-mono">AMMUNITION: {weapon.ammunition}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="specs" className="h-full">
            <div className="glass-panel bg-muted/10 border border-border p-4 rounded-md h-full overflow-y-auto">
              <h3 className="text-sm font-mono text-muted-foreground mb-3">TECHNICAL SPECIFICATIONS</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">DISPLACEMENT</p>
                    <p className="text-sm">{specs.displacement.toLocaleString()} tons</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">LENGTH</p>
                    <p className="text-sm">{specs.length} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">BEAM</p>
                    <p className="text-sm">{specs.beam} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">DRAFT</p>
                    <p className="text-sm">{specs.draft} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">MAX SPEED</p>
                    <p className="text-sm">{specs.speed} knots</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">RANGE</p>
                    <p className="text-sm">{specs.range.toLocaleString()} nm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">CREW</p>
                    <p className="text-sm">{specs.crew} personnel</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">AEGIS BASELINE</p>
                    <p className="text-sm">{specs.aegisBaseline}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">ANTI-AIR CAPABILITY</p>
                  <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-sm" 
                      style={{ width: `${specs.stats.antiAir}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">ANTI-SURFACE CAPABILITY</p>
                  <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-sm" 
                      style={{ width: `${specs.stats.antiSurface}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">ANTI-SUBMARINE CAPABILITY</p>
                  <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-sm" 
                      style={{ width: `${specs.stats.antiSubmarine}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="mt-4 flex gap-2">
        <Button 
          variant="default" 
          className="w-1/2 font-mono" 
          onClick={onSelectShip}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          SELECT VESSEL
        </Button>
        <Button 
          variant="outline" 
          className="w-1/2 font-mono" 
          onClick={handleSelectForMission}
        >
          SELECT MISSION
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ShipDetails;
