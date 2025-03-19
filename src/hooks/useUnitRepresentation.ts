
import { useState, useCallback } from 'react';
import { UnitData, UnitRepresentation, UnitError } from '@/types/UnitTypes';
import { toast } from 'sonner';

/**
 * Custom hook that implements the UnitRepresentation interface
 */
export function useUnitRepresentation(): UnitRepresentation {
  const [units, setUnits] = useState<Map<string, UnitData>>(new Map());
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);

  /**
   * Formats error messages by replacing placeholders with actual values
   */
  const formatError = (error: string, ...args: any[]): string => {
    return error.replace(/{(\d+)}/g, (match, index) => {
      return typeof args[index] !== 'undefined' ? args[index] : match;
    });
  };

  /**
   * Renders a unit on the game grid
   */
  const renderUnit = useCallback((unitData: UnitData) => {
    if (!unitData.id) {
      toast.error(formatError(UnitError.INVALID_UNIT_DATA, "Missing unit ID"));
      return;
    }

    setUnits(currentUnits => {
      const newUnits = new Map(currentUnits);
      newUnits.set(unitData.id, unitData);
      return newUnits;
    });
  }, []);

  /**
   * Updates the position and rotation of a rendered unit
   */
  const updateUnitPosition = useCallback((
    unitId: string, 
    position: { x: number; y: number }, 
    rotation: number
  ) => {
    setUnits(currentUnits => {
      const newUnits = new Map(currentUnits);
      const unit = newUnits.get(unitId);
      
      if (!unit) {
        toast.error(formatError(UnitError.UNIT_NOT_FOUND, unitId));
        return currentUnits;
      }

      // Check if position is out of bounds (this would depend on your grid size)
      // This is a placeholder implementation
      if (position.x < 0 || position.y < 0 || position.x > 1000 || position.y > 1000) {
        toast.error(UnitError.OUT_OF_BOUNDS);
        return currentUnits;
      }

      // Update the unit with the new position and rotation
      newUnits.set(unitId, {
        ...unit,
        position,
        rotation
      });
      
      return newUnits;
    });
  }, []);

  /**
   * Selects a unit
   */
  const selectUnit = useCallback((unitId: string | null) => {
    if (unitId !== null && !units.has(unitId)) {
      toast.error(formatError(UnitError.UNIT_NOT_FOUND, unitId));
      return;
    }
    
    setSelectedUnitId(unitId);
    
    // You could emit an event or call a callback function here
    // to notify other components about the selection change
  }, [units]);

  /**
   * Gets the currently selected unit
   */
  const getSelectedUnit = useCallback((): string | null => {
    return selectedUnitId;
  }, [selectedUnitId]);

  /**
   * Handles a mouse hover event over a unit
   */
  const handleHover = useCallback((
    unitId: string | null, 
    position: { x: number; y: number }
  ) => {
    setHoveredUnitId(unitId);
    
    // Additional hover logic can be implemented here
    // For example, displaying a tooltip or highlighting the unit
  }, []);

  /**
   * Handles a right-click event on a unit to display a context menu
   */
  const handleContextMenu = useCallback((
    unitId: string, 
    position: { x: number; y: number }
  ) => {
    if (!units.has(unitId)) {
      toast.error(formatError(UnitError.UNIT_NOT_FOUND, unitId));
      return;
    }

    // Context menu logic would go here
    // This could involve setting state for a context menu component
    // or emitting an event for another component to handle
    console.log(`Context menu requested for unit ${unitId} at position:`, position);
  }, [units]);

  /**
   * Sets all unit data to be rendered
   */
  const setAllUnits = useCallback((unitDataArray: UnitData[]) => {
    const newUnits = new Map<string, UnitData>();
    
    unitDataArray.forEach(unit => {
      if (unit.id) {
        newUnits.set(unit.id, unit);
      } else {
        toast.error(formatError(UnitError.INVALID_UNIT_DATA, "Missing unit ID"));
      }
    });
    
    setUnits(newUnits);
  }, []);

  /**
   * Removes a unit from the rendered units
   */
  const removeUnit = useCallback((unitId: string) => {
    setUnits(currentUnits => {
      if (!currentUnits.has(unitId)) {
        toast.error(formatError(UnitError.UNIT_NOT_FOUND, unitId));
        return currentUnits;
      }

      const newUnits = new Map(currentUnits);
      newUnits.delete(unitId);
      
      // If the removed unit was selected, clear the selection
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null);
      }
      
      // If the removed unit was hovered, clear the hover state
      if (hoveredUnitId === unitId) {
        setHoveredUnitId(null);
      }
      
      return newUnits;
    });
  }, [selectedUnitId, hoveredUnitId]);

  return {
    renderUnit,
    updateUnitPosition,
    selectUnit,
    getSelectedUnit,
    handleHover,
    handleContextMenu,
    setUnits: setAllUnits,
    removeUnit
  };
}
