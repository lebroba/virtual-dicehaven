
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ShipEntity, AmmoType, Weather } from '../types/Game';

interface ShipControlProps {
  ship: ShipEntity;
  windDirection: number;
  windSpeed: number;
  weather: Weather;
  onCourseChange: (course: number) => void;
  onSpeedChange: (speed: number) => void;
  onSailConfigChange: (config: 'full' | 'battle' | 'reduced' | 'minimal' | 'none') => void;
  onFireCannons: (side: 'port' | 'starboard' | 'bow' | 'stern') => void;
  onRepair: (type: 'hull' | 'rigging' | 'mast' | 'rudder' | 'fire') => void;
  onAmmoChange: (side: 'port' | 'starboard' | 'bow' | 'stern', ammo: AmmoType) => void;
}

const ShipControl: React.FC<ShipControlProps> = ({
  ship,
  windDirection,
  windSpeed,
  weather,
  onCourseChange,
  onSpeedChange,
  onSailConfigChange,
  onFireCannons,
  onRepair,
  onAmmoChange
}) => {
  const [selectedTab, setSelectedTab] = useState('sailing');
  const [portAmmo, setPortAmmo] = useState<AmmoType>('roundShot');
  const [starboardAmmo, setStarboardAmmo] = useState<AmmoType>('roundShot');
  const [bowAmmo, setBowAmmo] = useState<AmmoType>('chainShot');
  const [sternAmmo, setSternAmmo] = useState<AmmoType>('chainShot');

  // Calculate relative wind direction to ship heading
  const relativeWindDir = ((windDirection - ship.rotation) + 360) % 360;
  let windEfficiency = 1.0;
  
  // Simple wind efficiency calculation based on relative wind direction
  // With max efficiency when wind is from behind (135-225°)
  if (relativeWindDir > 45 && relativeWindDir < 315) {
    if (relativeWindDir > 135 && relativeWindDir < 225) {
      // Wind from behind - max efficiency
      windEfficiency = 1.0;
    } else if (relativeWindDir > 225 && relativeWindDir < 315) {
      // Wind from port side - good efficiency
      windEfficiency = 0.8;
    } else if (relativeWindDir > 45 && relativeWindDir < 135) {
      // Wind from starboard side - good efficiency
      windEfficiency = 0.8;
    }
  } else {
    // Wind from ahead - worst efficiency (into the wind)
    windEfficiency = 0.3;
  }
  
  // Weather affects speed
  const weatherEffects = {
    'clear': 1.0,
    'cloudy': 0.9,
    'rain': 0.7,
    'fog': 0.8
  };
  
  const weatherMultiplier = weatherEffects[weather];
  
  // Handle course change from the heading wheel
  const handleCourseChange = (newCourse: number) => {
    onCourseChange(newCourse);
  };
  
  // Handle speed change from the speed slider
  const handleSpeedChange = (newSpeed: number[]) => {
    onSpeedChange(newSpeed[0]);
  };
  
  // Handle sail configuration changes
  const handleSailConfig = (config: 'full' | 'battle' | 'reduced' | 'minimal' | 'none') => {
    onSailConfigChange(config);
  };
  
  // Handle ammunition change
  const handleAmmoChange = (side: 'port' | 'starboard' | 'bow' | 'stern', ammo: AmmoType) => {
    switch (side) {
      case 'port':
        setPortAmmo(ammo);
        break;
      case 'starboard':
        setStarboardAmmo(ammo);
        break;
      case 'bow':
        setBowAmmo(ammo);
        break;
      case 'stern':
        setSternAmmo(ammo);
        break;
    }
    
    onAmmoChange(side, ammo);
  };
  
  // Determine color based on damage level
  const getDamageColor = (value: number): string => {
    if (value > 70) return "text-green-500";
    if (value > 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Calculate cannon reload status (default to "Ready" if no cannons array)
  const getCannonStatus = (side: 'port' | 'starboard' | 'bow' | 'stern'): [number, string] => {
    if (!ship.cannons) return [100, "Ready"];
    
    const cannonsOnSide = ship.cannons.filter(c => c.location === side);
    if (cannonsOnSide.length === 0) return [0, "N/A"];
    
    const readyCannons = cannonsOnSide.filter(c => c.status === 'ready').length;
    const totalCannons = cannonsOnSide.length;
    const percentage = (readyCannons / totalCannons) * 100;
    
    if (percentage === 100) return [100, "Ready"];
    if (percentage === 0) return [0, "Reloading"];
    return [percentage, `${readyCannons}/${totalCannons} Ready`];
  };

  // Ship status messages based on condition
  const getStatusMessage = (): string => {
    if (ship.status === 'sinking') return "SINKING!";
    if (ship.damageState.onFire) return "ON FIRE!";
    if (ship.damageState.floodingRate > 0) return "TAKING ON WATER!";
    if (ship.damageState.hullIntegrity < 30) return "CRITICAL DAMAGE!";
    if (ship.currentCrew < ship.maxCrew * 0.3) return "CREW DEPLETED!";
    
    if (ship.status === 'boarding') return "BOARDING ACTION";
    if (ship.status === 'combat') return "ENGAGED IN COMBAT";
    if (ship.status === 'repairing') return "MAKING REPAIRS";
    if (ship.status === 'moving' && ship.currentSpeed > 0) return "UNDERWAY";
    
    return "STANDING BY";
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{ship.name}</span>
          <span className={`text-sm px-2 py-1 rounded ${
            ship.status === 'idle' ? 'bg-slate-200 text-slate-700' : 
            ship.status === 'moving' ? 'bg-blue-100 text-blue-700' :
            ship.status === 'combat' ? 'bg-red-100 text-red-700' :
            ship.status === 'boarding' ? 'bg-purple-100 text-purple-700' :
            ship.status === 'boarded' ? 'bg-yellow-100 text-yellow-700' :
            ship.status === 'sinking' ? 'bg-red-700 text-white' : ''
          }`}>
            {ship.status.charAt(0).toUpperCase() + ship.status.slice(1)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sailing" onValueChange={setSelectedTab} value={selectedTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="sailing">Sailing</TabsTrigger>
            <TabsTrigger value="combat">Combat</TabsTrigger>
            <TabsTrigger value="repairs">Repairs</TabsTrigger>
          </TabsList>
          
          {/* Sailing Controls */}
          <TabsContent value="sailing">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Course: {ship.rotation}°</label>
                  <div className="flex space-x-1">
                    <Button size="sm" onClick={() => handleCourseChange((ship.rotation - 15 + 360) % 360)}>⟲</Button>
                    <Button size="sm" onClick={() => handleCourseChange((ship.rotation + 15) % 360)}>⟳</Button>
                  </div>
                </div>
                <div className="relative h-32 w-32 rounded-full bg-slate-100 mx-auto">
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-blue-500" 
                       style={{
                         transform: `translate(-50%, -100%) rotate(${ship.rotation}deg)`,
                         transformOrigin: 'bottom center'
                       }}>
                    <div className="w-3 h-3 rounded-full bg-blue-700 absolute -top-1.5 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-14 bg-red-500 opacity-50" 
                       style={{
                         transform: `translate(-50%, -100%) rotate(${windDirection}deg)`,
                         transformOrigin: 'bottom center'
                       }}>
                    <div className="w-2 h-2 rounded-full bg-red-700 absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <div className="text-xs text-center mt-2">
                  <p>Wind: {windDirection}° at {windSpeed} knots ({Math.round(windEfficiency * 100)}% efficiency)</p>
                  <p>Weather: {weather} ({Math.round(weatherMultiplier * 100)}% sailing efficiency)</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Speed</label>
                <Slider
                  value={[ship.currentSpeed]}
                  max={ship.maxSpeed}
                  step={1}
                  onValueChange={handleSpeedChange}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Stop</span>
                  <span>Half</span>
                  <span>Full</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Sail Configuration</label>
                <div className="grid grid-cols-5 gap-1 mt-2">
                  <Button 
                    variant={ship.sailConfiguration?.currentConfig === 'full' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleSailConfig('full')}
                    className="text-xs"
                  >
                    Full
                  </Button>
                  <Button 
                    variant={ship.sailConfiguration?.currentConfig === 'battle' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleSailConfig('battle')}
                    className="text-xs"
                  >
                    Battle
                  </Button>
                  <Button 
                    variant={ship.sailConfiguration?.currentConfig === 'reduced' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleSailConfig('reduced')}
                    className="text-xs"
                  >
                    Reduced
                  </Button>
                  <Button 
                    variant={ship.sailConfiguration?.currentConfig === 'minimal' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleSailConfig('minimal')}
                    className="text-xs"
                  >
                    Minimal
                  </Button>
                  <Button 
                    variant={ship.sailConfiguration?.currentConfig === 'none' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleSailConfig('none')}
                    className="text-xs"
                  >
                    None
                  </Button>
                </div>
                
                {ship.sailConfiguration && (
                  <div className="text-xs text-center mt-2 text-slate-500">
                    <p>Main: {ship.sailConfiguration.mainSails}% • Top: {ship.sailConfiguration.topSails}%</p>
                    <p>Jibs: {ship.sailConfiguration.jibs}% • Spanker: {ship.sailConfiguration.spanker}%</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Combat Controls */}
          <TabsContent value="combat">
            <div className="space-y-4">
              {/* Port Guns */}
              <div className="border rounded p-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Port Guns</label>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant={portAmmo === 'roundShot' ? 'default' : 'outline'} 
                      className="text-xs"
                      onClick={() => handleAmmoChange('port', 'roundShot')}
                    >
                      Round
                    </Button>
                    <Button 
                      size="sm" 
                      variant={portAmmo === 'chainShot' ? 'default' : 'outline'} 
                      className="text-xs"
                      onClick={() => handleAmmoChange('port', 'chainShot')}
                    >
                      Chain
                    </Button>
                    <Button 
                      size="sm" 
                      variant={portAmmo === 'grapeShot' ? 'default' : 'outline'} 
                      className="text-xs"
                      onClick={() => handleAmmoChange('port', 'grapeShot')}
                    >
                      Grape
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full mt-2" 
                  onClick={() => onFireCannons('port')}
                  variant="destructive"
                >
                  Fire Port Guns
                </Button>
              </div>
              
              {/* Starboard Guns */}
              <div className="border rounded p-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Starboard Guns</label>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant={starboardAmmo === 'roundShot' ? 'default' : 'outline'} 
                      className="text-xs"
                      onClick={() => handleAmmoChange('starboard', 'roundShot')}
                    >
                      Round
                    </Button>
                    <Button 
                      size="sm" 
                      variant={starboardAmmo === 'chainShot' ? 'default' : 'outline'} 
                      className="text-xs"
                      onClick={() => handleAmmoChange('starboard', 'chainShot')}
                    >
                      Chain
                    </Button>
                    <Button 
                      size="sm" 
                      variant={starboardAmmo === 'grapeShot' ? 'default' : 'outline'} 
                      className="text-xs"
                      onClick={() => handleAmmoChange('starboard', 'grapeShot')}
                    >
                      Grape
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full mt-2" 
                  onClick={() => onFireCannons('starboard')}
                  variant="destructive"
                >
                  Fire Starboard Guns
                </Button>
              </div>
              
              {/* Bow & Stern Guns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded p-2">
                  <label className="text-sm font-medium">Bow Guns</label>
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => onFireCannons('bow')}
                    variant="destructive"
                    size="sm"
                  >
                    Fire Bow Guns
                  </Button>
                </div>
                <div className="border rounded p-2">
                  <label className="text-sm font-medium">Stern Guns</label>
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => onFireCannons('stern')}
                    variant="destructive"
                    size="sm"
                  >
                    Fire Stern Guns
                  </Button>
                </div>
              </div>
              
              {/* Crew & Boarding */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Crew Complement</span>
                  <span>{ship.currentCrew}/{ship.maxCrew} sailors</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(ship.currentCrew / ship.maxCrew) * 100}%` }}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="destructive"
                    size="sm"
                    disabled={ship.currentCrew < ship.maxCrew * 0.3}
                  >
                    Prepare to Board
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Repairs Tab */}
          <TabsContent value="repairs">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => onRepair('hull')}>
                  Repair Hull
                </Button>
                <Button onClick={() => onRepair('rigging')}>
                  Repair Rigging
                </Button>
                <Button onClick={() => onRepair('mast')}>
                  Repair Mast
                </Button>
                <Button onClick={() => onRepair('rudder')}>
                  Repair Rudder
                </Button>
              </div>
              
              <div className="mt-4">
                <Button 
                  className="w-full" 
                  onClick={() => onRepair('fire')}
                  variant="destructive"
                  disabled={!ship.damageState.onFire}
                >
                  Extinguish Fires
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div>
                  <div className="text-sm font-medium">Hull</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${ship.damageState.hullIntegrity}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Rigging</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${100 - ship.damageState.riggingDamage}%` }}
                    />
                  </div>
                </div>
                
                {ship.damageState.masts && (
                  <div className="col-span-2 mt-2">
                    <div className="text-sm font-medium mb-1">Masts</div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <div className="text-xs">Fore</div>
                        <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full" 
                            style={{ width: `${ship.damageState.masts.fore}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs">Main</div>
                        <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full" 
                            style={{ width: `${ship.damageState.masts.main}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs">Mizzen</div>
                        <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full" 
                            style={{ width: `${ship.damageState.masts.mizzen}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="col-span-2 mt-2">
                  <div className="text-sm font-medium">Rudder</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${100 - ship.damageState.rudderDamage}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {ship.damageState.onFire && (
                <div className="p-2 bg-red-100 rounded mt-4">
                  <div className="text-red-600 font-bold">Ship On Fire!</div>
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => onRepair('fire')}
                    variant="destructive"
                  >
                    Fight Fire!
                  </Button>
                </div>
              )}
              
              {ship.damageState.floodingRate > 0 && (
                <div className="p-2 bg-blue-100 rounded mt-4">
                  <div className="text-blue-600 font-bold">Taking on Water - Rate: {ship.damageState.floodingRate}</div>
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => onRepair('hull')}
                    variant="secondary"
                  >
                    Man the Pumps!
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShipControl;
