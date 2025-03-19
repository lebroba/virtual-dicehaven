
import React, { useEffect, useState } from 'react';
import { UnitData, UnitRepresentation } from '@/types/UnitTypes';
import UnitRepresentationImpl from './UnitRepresentationImpl';
import { useGame } from '@/context/GameContext';

interface GameUnitsProps {
  units?: UnitData[]; // Optional, can use context instead
}

const GameUnits: React.FC<GameUnitsProps> = ({ units: propUnits }) => {
  // Get game context
  const { gridSize } = useGame();
  const [unitRepresentation, setUnitRepresentation] = useState<UnitRepresentation | null>(null);
  
  // Use units from props or default to empty array
  const units = propUnits || [];

  // Set the units in the unitRepresentation when they change
  useEffect(() => {
    if (unitRepresentation && units.length > 0) {
      unitRepresentation.setUnits(units);
    }
  }, [units, unitRepresentation]);

  const handleUnitSelected = (event: { unitId: string | null }) => {
    console.log('Unit selected:', event.unitId);
  };

  const handleUnitHover = (event: { unitId: string | null; position: { x: number; y: number } }) => {
    // Handle hover logic here
  };

  const handleUnitContextMenu = (unitId: string, position: { x: number; y: number }) => {
    console.log('Context menu opened for unit:', unitId, 'at position:', position);
  };

  const handleUnitRepresentationReady = (representation: UnitRepresentation) => {
    setUnitRepresentation(representation);
  };

  return (
    <UnitRepresentationImpl
      onUnitSelected={handleUnitSelected}
      onUnitHover={handleUnitHover}
      onUnitContextMenu={handleUnitContextMenu}
      onUnitRepresentationReady={handleUnitRepresentationReady}
      gridSize={gridSize}
    />
  );
};

export default GameUnits;
