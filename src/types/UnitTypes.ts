
export interface UnitData {
  id: string; // Unique unit ID
  type: string; // "ship", "aircraft", etc.
  playerId: string; // Player ID owning the unit
  position: { x: number; y: number }; // Grid coordinates
  rotation: number; // Rotation in degrees
  speed: number;
  turningRadius: number;
  weaponRanges: { [weaponType: string]: number }; // Weapon ranges
  damageValues: { [weaponType: string]: number }; // Weapon damage
  ammunition: { [weaponType: string]: number }; // Ammunition counts
  detectionRanges: {
    radar: number;
    sonar: number;
    visual: number;
  };
  health: number;
  maxHealth: number;
  status: string[]; // e.g., "damaged", "detected"
}

export interface UnitSelectionEvent {
  unitId: string | null; // ID of the selected unit, null if deselected
}

export interface UnitHoverEvent {
  unitId: string | null;
  position: { x: number; y: number }; // Mouse position
}

export interface UnitRepresentation {
  /**
   * Renders a unit on the game grid.
   * @param unitData The unit data to render.
   */
  renderUnit(unitData: UnitData): void;

  /**
   * Updates the position and rotation of a rendered unit.
   * @param unitId The ID of the unit to update.
   * @param position The new grid coordinates.
   * @param rotation The new rotation in degrees.
   */
  updateUnitPosition(unitId: string, position: { x: number; y: number }, rotation: number): void;

  /**
   * Selects a unit.
   * @param unitId The ID of the unit to select, null to deselect.
   */
  selectUnit(unitId: string | null): void;

  /**
   * Gets the currently selected unit.
   * @returns The ID of the selected unit, or null if none.
   */
  getSelectedUnit(): string | null;

  /**
   * Handles a mouse hover event over a unit.
   * @param unitId The ID of the hovered unit, or null if no unit is hovered.
   * @param position The mouse coordinates.
   */
  handleHover(unitId: string | null, position: { x: number; y: number }): void;

  /**
   * Handles a right-click event on a unit to display a context menu.
   * @param unitId The ID of the unit right-clicked.
   * @param position The mouse coordinates.
   */
  handleContextMenu(unitId: string, position: { x: number; y: number }): void;

  /**
   * Sets all unit data to be rendered.
   * @param unitDataArray an array of unit data to be rendered.
   */
  setUnits(unitDataArray: UnitData[]): void;

  /**
   * Removes a unit from the rendered units.
   * @param unitId The ID of the unit to be removed.
   */
  removeUnit(unitId: string): void;
}

export enum UnitError {
  UNIT_NOT_FOUND = "Unit with ID {0} not found.",
  INVALID_UNIT_DATA = "Invalid unit data: {0}.",
  UNIT_COLLISION = "Unit collision detected at position ({0}, {1}).",
  OUT_OF_BOUNDS = "Unit attempted to move outside map boundaries.",
  UNAUTHORIZED_ACTION = "Player not authorized to perform this action on unit {0}.",
  ASYNC_DATA_LOAD_ERROR = "Error loading unit data asynchronously."
}
