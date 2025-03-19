
import React, { useState, useRef, useEffect } from 'react';
import { UnitRepresentation, UnitData, UnitHoverEvent, UnitSelectionEvent } from '@/types/UnitTypes';
import { MilitarySymbol } from './MilitarySymbol';
import { toast } from 'sonner';

interface UnitRepresentationProps {
  onUnitSelected?: (event: UnitSelectionEvent) => void;
  onUnitHover?: (event: UnitHoverEvent) => void;
  onUnitContextMenu?: (unitId: string, position: { x: number; y: number }) => void;
  onUnitRepresentationReady?: (unitRepresentation: UnitRepresentation) => void;
  gridSize?: number;
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

const UnitRepresentationImpl: React.FC<UnitRepresentationProps> = ({
  onUnitSelected = () => {},
  onUnitHover = () => {},
  onUnitContextMenu = () => {},
  onUnitRepresentationReady,
  gridSize = 50,
}) => {
  const [units, setUnitsState] = useState<UnitData[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format error messages by replacing placeholders with actual values
  const formatError = (error: string, ...args: any[]): string => {
    return error.replace(/{(\d+)}/g, (match, index) => {
      return typeof args[index] !== 'undefined' ? args[index] : match;
    });
  };

  // Implement UnitRepresentation interface methods
  const unitRepresentation: UnitRepresentation = {
    renderUnit(unitData: UnitData) {
      if (!unitData.id) {
        toast.error(formatError("Invalid unit data: Missing unit ID"));
        return;
      }

      setUnitsState(prevUnits => {
        // Check if unit exists, update it if it does, otherwise add it
        const exists = prevUnits.some(unit => unit.id === unitData.id);
        if (exists) {
          return prevUnits.map(unit => 
            unit.id === unitData.id ? unitData : unit
          );
        } else {
          return [...prevUnits, unitData];
        }
      });
    },

    updateUnitPosition(unitId: string, position: { x: number; y: number }, rotation: number) {
      setUnitsState(prevUnits => {
        const unitExists = prevUnits.some(unit => unit.id === unitId);
        if (!unitExists) {
          toast.error(formatError("Unit with ID {0} not found.", unitId));
          return prevUnits;
        }

        // Check if position is out of bounds (this would depend on your grid size)
        if (position.x < 0 || position.y < 0 || position.x > 1000 || position.y > 1000) {
          toast.error("Unit attempted to move outside map boundaries.");
          return prevUnits;
        }

        return prevUnits.map(unit =>
          unit.id === unitId ? { ...unit, position, rotation } : unit
        );
      });
    },

    selectUnit(unitId: string | null) {
      if (unitId !== null && !units.some(unit => unit.id === unitId)) {
        toast.error(formatError("Unit with ID {0} not found.", unitId));
        return;
      }
      
      setSelectedUnitId(unitId);
      onUnitSelected({ unitId });
    },

    getSelectedUnit() {
      return selectedUnitId;
    },

    handleHover(unitId: string | null, position: { x: number; y: number }) {
      onUnitHover({ unitId, position });
    },

    handleContextMenu(unitId: string, position: { x: number; y: number }) {
      if (!units.some(unit => unit.id === unitId)) {
        toast.error(formatError("Unit with ID {0} not found.", unitId));
        return;
      }
      onUnitContextMenu(unitId, position);
    },

    setUnits(unitDataArray: UnitData[]) {
      // Validate all units have IDs
      const validUnits = unitDataArray.filter(unit => {
        if (!unit.id) {
          toast.error("Invalid unit data: Missing unit ID");
          return false;
        }
        return true;
      });
      
      setUnitsState(validUnits);
    },

    removeUnit(unitId: string) {
      setUnitsState(prevUnits => {
        const unitExists = prevUnits.some(unit => unit.id === unitId);
        if (!unitExists) {
          toast.error(formatError("Unit with ID {0} not found.", unitId));
          return prevUnits;
        }
        
        // If the removed unit was selected, clear the selection
        if (selectedUnitId === unitId) {
          setSelectedUnitId(null);
        }
        
        return prevUnits.filter(unit => unit.id !== unitId);
      });
    }
  };

  // Provide the unitRepresentation to parent components
  useEffect(() => {
    if (containerRef.current && onUnitRepresentationReady) {
      onUnitRepresentationReady(unitRepresentation);
    }
  }, [onUnitRepresentationReady]);

  // Render unit tokens
  const renderUnits = () => {
    return units.map((unit) => {
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
          onClick={() => unitRepresentation.selectUnit(unit.id)}
          onMouseEnter={(e) => unitRepresentation.handleHover(unit.id, { x: e.clientX, y: e.clientY })}
          onMouseLeave={() => unitRepresentation.handleHover(null, { x: 0, y: 0 })}
          onContextMenu={(e) => {
            e.preventDefault();
            unitRepresentation.handleContextMenu(unit.id, { x: e.clientX, y: e.clientY });
          }}
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
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto">
        {renderUnits()}
      </div>
    </div>
  );
};

export default UnitRepresentationImpl;
