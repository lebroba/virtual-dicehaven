import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Gauge } from "./Gauge";
import { 
  ShipEntity, 
  ShipClass,
  AmmoType,
  Weather
} from "../../types/Game";

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

export const ShipControl: React.FC<ShipControlProps> = ({
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
  const [selectedTab, setSelectedTab] = useState("navigation");
  
  // Ship classification name for display
  const getShipClassName = (shipClass: ShipClass): string => {
    switch (shipClass) {
      case 'FirstRate': return '1st Rate Ship of the Line';
      case 'SecondRate': return '2nd Rate Ship of the Line';
      case 'ThirdRate': return '3rd Rate Ship of the Line';
      case 'FourthRate': return '4th Rate Ship of the Line';
      case 'FifthRate': return '5th Rate Frigate';
      case 'SixthRate': return '6th Rate Frigate';
      case 'Sloop': return 'Sloop of War';
      case 'Cutter': return 'Cutter';
      case 'Fireship': return 'Fireship';
      default: return 'Unknown Vessel';
    }
  };
  
  // Calculate wind relationship to course
  const getWindRelationship = (): string => {
    // Calculate relative wind angle to ship heading
    const relativeAngle = ((windDirection - ship.rotation) + 360) % 360;
    
    // Determine wind position
    if (relativeAngle < 45 || relativeAngle > 315) {
      return "Head Wind (Against)";
    } else if ((relativeAngle >= 45 && relativeAngle < 90) || 
               (relativeAngle > 270 && relativeAngle <= 315)) {
      return "Close Hauled";
    } else if ((relativeAngle >= 90 && relativeAngle < 135) || 
               (relativeAngle > 225 && relativeAngle <= 270)) {
      return "Beam Reach";
    } else if ((relativeAngle >= 135 && relativeAngle < 180) || 
               (relativeAngle > 180 && relativeAngle <= 225)) {
      return "Broad Reach";
    } else { // relativeAngle === 180
      return "Running (With)";
    }
  };
  
  // Determine color based on damage level
  const getDamageColor = (value: number): string => {
    if (value > 70) return "text-green-500";
    if (value > 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Calculate cannon reload status
  const getCannonStatus = (side: 'port' | 'starboard' | 'bow' | 'stern'): [number, string] => {
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
    <Card className="w-full max-w-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {ship.name}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getShipClassName(ship.shipClass)} • {ship.nationality}
            </p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-md">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {getStatusMessage()}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="combat">Combat</TabsTrigger>
          <TabsTrigger value="status">Ship Status</TabsTrigger>
        </TabsList>
        
        {/* Navigation Tab */}
        <TabsContent value="navigation" className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left column with course controls */}
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Course & Heading</h3>
              
              <div className="relative">
                <Gauge 
                  value={ship.rotation} 
                  min={0} 
                  max={359}
                  onChange={onCourseChange}
                  size={160}
                  label={`${ship.rotation}°`}
                  markerColor="#ef4444"
                />
                
                {/* Wind direction indicator */}
                <div 
                  className="absolute top-1/2 left-1/2 w-1 h-12 -translate-x-1/2 -mt-12 bg-blue-500 opacity-50"
                  style={{ 
                    transform: `rotate(${windDirection}deg)`,
                    transformOrigin: 'bottom'
                  }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-70" />
                </div>
              </div>
              
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                <p>Wind: {windDirection}° at {windSpeed} knots</p>
                <p>Sailing: {getWindRelationship()}</p>
                <p>Weather: {weather.charAt(0).toUpperCase() + weather.slice(1)}</p>
              </div>
            </div>
            
            {/* Right column with speed controls */}
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Speed & Sails</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Current Speed</span>
                  <span className="font-medium">{ship.currentSpeed} knots</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${(ship.currentSpeed / ship.maxSpeed) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onSpeedChange(Math.max(0, ship.currentSpeed - 1))}
                    disabled={ship.currentSpeed <= 0}
                  >
                    Slower
                  </Button>
                  <span className="text-sm font-medium">{ship.currentSpeed}/{ship.maxSpeed}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onSpeedChange(Math.min(ship.maxSpeed, ship.currentSpeed + 1))}
                    disabled={ship.currentSpeed >= ship.maxSpeed}
                  >
                    Faster
                  </Button>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sail Configuration</h3>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={ship.sailConfiguration.currentConfig === 'full' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSailConfigChange('full')}
                >
                  Full Sail
                </Button>
                <Button
                  variant={ship.sailConfiguration.currentConfig === 'battle' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSailConfigChange('battle')}
                >
                  Battle Sail
                </Button>
                <Button
                  variant={ship.sailConfiguration.currentConfig === 'reduced' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSailConfigChange('reduced')}
                >
                  Reduced Sail
                </Button>
                <Button
                  variant={ship.sailConfiguration.currentConfig === 'minimal' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSailConfigChange('minimal')}
                >
                  Minimal Sail
                </Button>
              </div>
              
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                <p>Main: {ship.sailConfiguration.mainSails}% • Top: {ship.sailConfiguration.topSails}%</p>
                <p>Jibs: {ship.sailConfiguration.jibs}% • Spanker: {ship.sailConfiguration.spanker}%</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Combat Tab */}
        <TabsContent value="combat" className="p-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cannons</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Port side cannons */}
              <div className="space-y-2 border rounded-md p-2 border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Port Guns</span>
                  <span className="text-xs">{getCannonStatus('port')[1]}</span>
                </div>
                <Progress value={getCannonStatus('port')[0]} className="h-1" />
                <div className="flex justify-between gap-1">
                  <select 
                    className="text-xs py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex-1"
                    onChange={(e) => onAmmoChange('port', e.target.value as AmmoType)}
                    defaultValue="roundshot"
                  >
                    <option value="roundshot">Round Shot</option>
                    <option value="chainshot">Chain Shot</option>
                    <option value="grapeshot">Grape Shot</option>
                    <option value="doubleshot">Double Shot</option>
                    <option value="hotshot">Hot Shot</option>
                  </select>
                  <Button 
                    size="sm" 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => onFireCannons('port')}
                    disabled={getCannonStatus('port')[0] === 0}
                  >
                    FIRE!
                  </Button>
                </div>
              </div>
              
              {/* Starboard side cannons */}
              <div className="space-y-2 border rounded-md p-2 border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Starboard Guns</span>
                  <span className="text-xs">{getCannonStatus('starboard')[1]}</span>
                </div>
                <Progress value={getCannonStatus('starboard')[0]} className="h-1" />
                <div className="flex justify-between gap-1">
                  <select 
                    className="text-xs py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex-1"
                    onChange={(e) => onAmmoChange('starboard', e.target.value as AmmoType)}
                    defaultValue="roundshot"
                  >
                    <option value="roundshot">Round Shot</option>
                    <option value="chainshot">Chain Shot</option>
                    <option value="grapeshot">Grape Shot</option>
                    <option value="doubleshot">Double Shot</option>
                    <option value="hotshot">Hot Shot</option>
                  </select>
                  <Button 
                    size="sm" 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => onFireCannons('starboard')}
                    disabled={getCannonStatus('starboard')[0] === 0}
                  >
                    FIRE!
                  </Button>
                </div>
              </div>
              
              {/* Bow chasers */}
              <div className="space-y-2 border rounded-md p-2 border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bow Chasers</span>
                  <span className="text-xs">{getCannonStatus('bow')[1]}</span>
                </div>
                <Progress value={getCannonStatus('bow')[0]} className="h-1" />
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onFireCannons('bow')}
                    disabled={getCannonStatus('bow')[0] === 0}
                  >
                    Fire Bow Guns
                  </Button>
                </div>
              </div>
              
              {/* Stern chasers */}
              <div className="space-y-2 border rounded-md p-2 border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stern Chasers</span>
                  <span className="text-xs">{getCannonStatus('stern')[1]}</span>
                </div>
                <Progress value={getCannonStatus('stern')[0]} className="h-1" />
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onFireCannons('stern')}
                    disabled={getCannonStatus('stern')[0] === 0}
                  >
                    Fire Stern Guns
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Crew & Boarding</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Crew Complement</span>
                <span>{ship.currentCrew}/{ship.maxCrew} sailors</span>
              </div>
              <Progress 
                value={(ship.currentCrew / ship.maxCrew) * 100} 
                className="h-2"
              />
              
              <div className="flex justify-end mt-3">
                <Button 
                  size="sm"
                  variant="destructive"
                  // Boarding functionality would be added here
                  disabled={ship.currentCrew < ship.maxCrew * 0.3}
                >
                  Prepare to Board
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Ship Status Tab */}
        <TabsContent value="status" className="p-4 space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ship Condition</h3>
            
            {/* Hull Integrity */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Hull Integrity</span>
                <span className={getDamageColor(ship.damageState.hullIntegrity)}>
                  {Math.round(ship.damageState.hullIntegrity)}%
                </span>
              </div>
              <Progress 
                value={ship.damageState.hullIntegrity} 
                className="h-2"
                indicatorClassName={ship.damageState.hullIntegrity > 70 ? "bg-green-500" : 
                                    ship.damageState.hullIntegrity > 40 ? "bg-yellow-500" : "bg-red-500"}
              />
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={() => onRepair('hull')}
                  disabled={ship.currentCrew < ship.maxCrew * 0.3 || ship.status === 'repairing'}
                >
                  Repair Hull
                </Button>
              </div>
            </div>
            
            {/* Rigging */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Rigging Status</span>
                <span className={getDamageColor(100 - ship.damageState.rigDamage)}>
                  {Math.round(100 - ship.damageState.rigDamage)}%
                </span>
              </div>
              <Progress 
                value={100 - ship.damageState.rigDamage} 
                className="h-2"
                indicatorClassName={(100 - ship.damageState.rigDamage) > 70 ? "bg-green-500" : 
                                   (100 - ship.damageState.rigDamage) > 40 ? "bg-yellow-500" : "bg-red-500"}
              />
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={() => onRepair('rigging')}
                  disabled={ship.currentCrew < ship.maxCrew * 0.3 || ship.status === 'repairing'}
                >
                  Repair Rigging
                </Button>
              </div>
            </div>
            
            {/* Masts */}
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs">Fore Mast</p>
                  <Progress 
                    value={ship.damageState.masts.fore} 
                    className="h-2 mt-1"
                    indicatorClassName={ship.damageState.masts.fore > 70 ? "bg-green-500" : 
                                       ship.damageState.masts.fore > 40 ? "bg-yellow-500" : "bg-red-500"}
                  />
                </div>
                <div>
                  <p className="text-xs">Main Mast</p>
                  <Progress 
                    value={ship.damageState.masts.main} 
                    className="h-2 mt-1"
                    indicatorClassName={ship.damageState.masts.main > 70 ? "bg-green-500" : 
                                       ship.damageState.masts.main > 40 ? "bg-yellow-500" : "bg-red-500"}
                  />
                </div>
                <div>
                  <p className="text-xs">Mizzen Mast</p>
                  <Progress 
                    value={ship.damageState.masts.mizzen} 
                    className="h-2 mt-1"
                    indicatorClassName={ship.damageState.masts.mizzen > 70 ? "bg-green-500" : 
                                       ship.damageState.masts.mizzen > 40 ? "bg-yellow-500" : "bg-red-500"}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={() => onRepair('mast')}
                  disabled={ship.currentCrew < ship.maxCrew * 0.3 || ship.status === 'repairing'}
                >
                  Repair Masts
                </Button>
              </div>
            </div>
            
            {/* Rudder */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Rudder Condition</span>
                <span className={getDamageColor(100 - ship.damageState.rudderDamage)}>
                  {Math.round(100 - ship.damageState.rudderDamage)}%
                </span>
              </div>
              <Progress 
                value={100 - ship.damageState.rudderDamage} 
                className="h-2"
                indicatorClassName={(100 - ship.damageState.rudderDamage) > 70 ? "bg-green-500" : 
                                   (100 - ship.damageState.rudderDamage) > 40 ? "bg-yellow-500" : "bg-red-500"}
              />
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={() => onRepair('rudder')}
                  disabled={ship.currentCrew < ship.maxCrew * 0.3 || ship.status === 'repairing'}
                >
                  Repair Rudder
                </Button>
              </div>
            </div>
            
            {/* Fire Status */}
            {ship.damageState.onFire && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-red-500 font-bold">FIRE ONBOARD!</span>
                  <span className="text-red-500">Spreading</span>
                </div>
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onRepair('fire')}
                    disabled={ship.currentCrew < ship.maxCrew * 0.3 || ship.status === 'repairing'}
                  >
                    Fight Fire!
                  </Button>
                </div>
              </div>
            )}
            
            {/* Flooding Status */}
            {ship.damageState.floodingRate > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-500 font-bold">TAKING ON WATER!</span>
                  <span className="text-blue-500">Rate: {ship.damageState.floodingRate.toFixed(1)}</span>
                </div>
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => onRepair('hull')}
                    disabled={ship.currentCrew < ship.maxCrew * 0.3 || ship.status === 'repairing'}
                  >
                    Man the Pumps!
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2">
        <div className="w-full flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Experience: Level {ship.experienceLevel}</span>
          <span>Supplies: {ship.currentSupplies}/{ship.maxSupplies}</span>
          <span>Casualties: {ship.damageState.crewCasualties}</span>
        </div>
      </CardFooter>
    </Card>
  );
};