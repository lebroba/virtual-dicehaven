
import React from 'react';
import { UnitData } from '@/types/UnitTypes';
import { useUnitRepresentation } from '@/hooks/useUnitRepresentation';
import UnitRenderer from './UnitRenderer';
import { useGame } from '@/context/GameContext';

interface GameUnitsProps {
  units?: UnitData[]; // Optional, can use context instead
}

const GameUnits: React.FC<GameUnitsProps> = ({ units: propUnits }) => {
  // Get game context
  const { gridSize } = useGame();
  
  // Initialize unit representation hook
  const unitRepresentation = useUnitRepresentation();
  
  // Use units from props or you could use units from context if available
  const units = propUnits || [
    // Some default units for testing or you could get them from context
  ];

  return (
    <UnitRenderer 
      units={units} 
      unitRepresentation={unitRepresentation} 
      gridSize={gridSize} 
    />
  );
};

export default GameUnits;
