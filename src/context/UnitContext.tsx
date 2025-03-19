
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UnitData, UnitRepresentation } from '@/types/UnitTypes';
import { useUnitRepresentation } from '@/hooks/useUnitRepresentation';

interface UnitContextType {
  units: UnitData[];
  selectedUnitId: string | null;
  unitRepresentation: UnitRepresentation;
  addUnit: (unit: UnitData) => void;
  updateUnit: (unitId: string, updates: Partial<UnitData>) => void;
  removeUnit: (unitId: string) => void;
  moveUnit: (unitId: string, position: { x: number; y: number }, rotation: number) => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const useUnitContext = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnitContext must be used within a UnitProvider');
  }
  return context;
};

interface UnitProviderProps {
  children: ReactNode;
  initialUnits?: UnitData[];
}

export const UnitProvider: React.FC<UnitProviderProps> = ({ children, initialUnits = [] }) => {
  const [units, setUnits] = useState<UnitData[]>(initialUnits);
  const unitRepresentation = useUnitRepresentation();

  // Set the units in the unitRepresentation when they change
  useEffect(() => {
    unitRepresentation.setUnits(units);
  }, [units]);

  // Add a new unit
  const addUnit = (unit: UnitData) => {
    setUnits(prev => {
      // Check if unit with this ID already exists
      if (prev.some(u => u.id === unit.id)) {
        // Replace existing unit
        return prev.map(u => u.id === unit.id ? unit : u);
      }
      // Add new unit
      return [...prev, unit];
    });
    unitRepresentation.renderUnit(unit);
  };

  // Update a unit with partial data
  const updateUnit = (unitId: string, updates: Partial<UnitData>) => {
    setUnits(prev => {
      return prev.map(unit => {
        if (unit.id === unitId) {
          return { ...unit, ...updates };
        }
        return unit;
      });
    });
  };

  // Remove a unit
  const removeUnit = (unitId: string) => {
    setUnits(prev => prev.filter(unit => unit.id !== unitId));
    unitRepresentation.removeUnit(unitId);
  };

  // Move a unit
  const moveUnit = (unitId: string, position: { x: number; y: number }, rotation: number) => {
    setUnits(prev => {
      return prev.map(unit => {
        if (unit.id === unitId) {
          return { ...unit, position, rotation };
        }
        return unit;
      });
    });
    unitRepresentation.updateUnitPosition(unitId, position, rotation);
  };

  const value = {
    units,
    selectedUnitId: unitRepresentation.getSelectedUnit(),
    unitRepresentation,
    addUnit,
    updateUnit,
    removeUnit,
    moveUnit
  };

  return (
    <UnitContext.Provider value={value}>
      {children}
    </UnitContext.Provider>
  );
};
