
import React, { useEffect, useMemo } from 'react';
import { UnitData, UnitRepresentation } from '@/types/UnitTypes';
import { MilitarySymbol } from './MilitarySymbol';

interface UnitRendererProps {
  units: UnitData[];
  unitRepresentation: UnitRepresentation;
  gridSize: number;
}

// Helper function to determine symbol identity based on unit data
const getSymbolIdentity = (unit: UnitData): 'friend' | 'neutral' | 'hostile' => {
  // This is a placeholder implementation
  // In a real application, you would determine this based on the current player
  const currentPlayerId = 'player1'; // This would come from your game state
  
  if (unit.playerId === currentPlayerId) {
    return 'friend';
  } else if (unit.status.includes('hostile')) {
    return 'hostile';
  } else {
    return 'neutral';
  }
};

// Helper function to determine symbol domain based on unit type
const getSymbolDomain = (unitType: string) => {
  switch (unitType.toLowerCase()) {
    case 'ship':
    case 'vessel':
      return 'sea-surface';
    case 'aircraft':
    case 'plane':
    case 'helicopter':
      return 'air';
    case 'submarine':
      return 'subsurface';
    case 'installation':
    case 'base':
      return 'land-installation';
    case 'vehicle':
      return 'land-equipment';
    case 'infantry':
    case 'soldiers':
      return 'land-unit';
    default:
      return 'unknown';
  }
};

const UnitRenderer: React.FC<UnitRendererProps> = ({ units, unitRepresentation, gridSize }) => {
  // Set units on component mount or when units change
  useEffect(() => {
    unitRepresentation.setUnits(units);
  }, [units, unitRepresentation]);

  // Get the currently selected unit ID
  const selectedUnitId = unitRepresentation.getSelectedUnit();

  const handleUnitClick = (unitId: string) => {
    unitRepresentation.selectUnit(unitId);
  };

  const handleUnitHover = (unitId: string, e: React.MouseEvent) => {
    unitRepresentation.handleHover(unitId, { x: e.clientX, y: e.clientY });
  };

  const handleUnitHoverEnd = () => {
    unitRepresentation.handleHover(null, { x: 0, y: 0 });
  };

  const handleUnitContextMenu = (unitId: string, e: React.MouseEvent) => {
    e.preventDefault();
    unitRepresentation.handleContextMenu(unitId, { x: e.clientX, y: e.clientY });
  };

  // Memoize the unit rendering to prevent unnecessary re-renders
  const renderedUnits = useMemo(() => {
    return units.map(unit => {
      const isSelected = unit.id === selectedUnitId;
      const symbolIdentity = getSymbolIdentity(unit);
      const symbolDomain = getSymbolDomain(unit.type);
      
      return (
        <div
          key={unit.id}
          className={`absolute cursor-pointer transition-transform duration-300 ${
            isSelected ? 'z-10' : 'z-0'
          }`}
          style={{
            left: unit.position.x,
            top: unit.position.y,
            transform: `rotate(${unit.rotation}deg)`,
            width: gridSize,
            height: gridSize
          }}
          onClick={() => handleUnitClick(unit.id)}
          onMouseEnter={(e) => handleUnitHover(unit.id, e)}
          onMouseLeave={handleUnitHoverEnd}
          onContextMenu={(e) => handleUnitContextMenu(unit.id, e)}
        >
          <MilitarySymbol
            identity={symbolIdentity}
            domain={symbolDomain}
            size={gridSize * 0.8}
            selected={isSelected}
          />
          
          {/* Health bar (optional) */}
          {unit.health < unit.maxHealth && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
              />
            </div>
          )}
          
          {/* Unit status indicators (optional) */}
          {unit.status.length > 0 && (
            <div className="absolute -top-2 -right-2 flex">
              {unit.status.includes('damaged') && (
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1" title="Damaged" />
              )}
              {unit.status.includes('detected') && (
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1" title="Detected" />
              )}
            </div>
          )}
        </div>
      );
    });
  }, [units, selectedUnitId, gridSize]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto">
        {renderedUnits}
      </div>
    </div>
  );
};

export default UnitRenderer;
