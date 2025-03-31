import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ShipEntity, Weather, AmmoType } from "../types/Game";

interface ShipControlProps {
  // Add properties expected by GameBoard.tsx
  ship?: ShipEntity;
  windDirection?: number;
  windSpeed?: number;
  weather?: Weather;
  onCourseChange?: (course: number) => void;
  onSpeedChange?: (speed: number) => void;
  onSailConfigChange?: (config: 'full' | 'battle' | 'reduced' | 'minimal' | 'none') => void;
  onFireCannons?: (side: 'port' | 'starboard' | 'bow' | 'stern') => void;
  onRepair?: (type: 'hull' | 'rigging' | 'mast' | 'rudder' | 'fire') => void;
  onAmmoChange?: (side: 'port' | 'starboard' | 'bow' | 'stern', ammo: AmmoType) => void;

  // Original properties (keep for backward compatibility)
  initialCourse?: number;
  initialSpeed?: number;
  maxSpeed?: number;
  maxHealth?: number;
  maxEnergy?: number;
  currentHealth?: number;
  currentEnergy?: number;
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
  onAmmoChange,
  initialCourse = 0,
  initialSpeed = 0,
  maxSpeed = 30,
  maxHealth = 100,
  maxEnergy = 100,
  currentHealth = 100,
  currentEnergy = 80,
}) => {
  // Use ship properties if available, otherwise fall back to the original props
  const course = ship?.rotation ?? initialCourse;
  const speed = ship?.currentSpeed ?? initialSpeed;
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  // Handle course change when dragging the arrow
  const handleCourseChange = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !dialRef.current) return;

    const dial = dialRef.current;
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate angle from center to mouse position
    const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    // Convert to degrees, adjust to start from North (90 degrees offset)
    // and ensure it's between 0-359 degrees
    let angleDeg = (Math.round(angleRad * (180 / Math.PI) + 90) + 360) % 360;
    
    if (onCourseChange) {
      onCourseChange(angleDeg);
    }
  };

  // Set up event listeners for dragging
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleCourseChange(e);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Handle speed changes
  const changeSpeed = (increment: number) => {
    const effectiveMaxSpeed = ship?.maxSpeed ?? maxSpeed;
    const newSpeed = Math.max(0, Math.min(effectiveMaxSpeed, (ship?.currentSpeed ?? speed) + increment));
    
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    }
  };

  // Use ship health values if available
  const healthMax = ship?.damageState?.hullIntegrity ?? maxHealth;
  const healthCurrent = ship?.damageState?.hullIntegrity ?? currentHealth;
  
  // Use ship energy values if available
  const energyMax = maxEnergy; 
  const energyCurrent = currentEnergy;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{ship?.name ?? "Ship Control"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Course control dial */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Course: {course}°</h3>
          <div 
            ref={dialRef}
            className="relative w-40 h-40 mx-auto rounded-full border-2 border-slate-300 bg-slate-100 dark:bg-slate-800"
            onMouseDown={(e) => {
              setIsDragging(true);
              handleCourseChange(e);
            }}
          >
            {/* Cardinal direction marks */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold">N</div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold">E</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold">S</div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold">W</div>
            
            {/* Center point */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500" />
            
            {/* Arrow indicator */}
            <div 
              className="absolute top-1/2 left-1/2 w-1 h-16 -translate-x-1/2 -mt-16 bg-red-500 rounded-t-full origin-bottom cursor-pointer"
              style={{ transform: `rotate(${course}deg)` }}
            />
          </div>
        </div>

        <Separator />

        {/* Speed control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Speed</h3>
            <div className="font-bold">{speed} knots</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => changeSpeed(-1)}
              disabled={speed <= 0}
            >
              -
            </Button>
            <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${(speed / (ship?.maxSpeed || maxSpeed)) * 100}%` }}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => changeSpeed(1)}
              disabled={speed >= (ship?.maxSpeed || maxSpeed)}
            >
              +
            </Button>
          </div>
        </div>

        <Separator />

        {/* Ship status */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Ship Status</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Hull Integrity</span>
              <span>{Math.round(healthCurrent)}/{healthMax}</span>
            </div>
            <Progress value={(healthCurrent / healthMax) * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Energy</span>
              <span>{energyCurrent}/{energyMax}</span>
            </div>
            <Progress 
              value={(energyCurrent / energyMax) * 100} 
              className="h-2 bg-slate-200 dark:bg-slate-700"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipControl;
