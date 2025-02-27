
export type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

/**
 * Roll a single die
 * @param sides Number of sides on the die
 * @returns Random number between 1 and sides
 */
export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Roll multiple dice of the same type
 * @param count Number of dice to roll
 * @param sides Number of sides on each die
 * @returns Array of roll results
 */
export const rollDice = (count: number, sides: number): number[] => {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides));
  }
  return results;
};

/**
 * Parse a dice notation string and roll the dice
 * @param notation Dice notation (e.g., "2d6+3")
 * @returns Object with results and total
 */
export const rollFromNotation = (notation: string): { 
  results: number[]; 
  total: number;
  modifier: number;
  sides: number;
  count: number;
} => {
  // Parse the notation (e.g., "2d6+3")
  const regex = /(\d+)d(\d+)(?:([\+\-])(\d+))?/i;
  const match = notation.match(regex);

  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifierSign = match[3] || "+";
  const modifierValue = match[4] ? parseInt(match[4], 10) : 0;
  const modifier = modifierSign === "+" ? modifierValue : -modifierValue;

  // Roll the dice
  const results = rollDice(count, sides);
  
  // Calculate total with modifier
  const diceTotal = results.reduce((sum, roll) => sum + roll, 0);
  const total = diceTotal + modifier;

  return {
    results,
    total,
    modifier,
    sides,
    count
  };
};

/**
 * Get the number of sides for a dice type
 * @param type Dice type (e.g., "d20")
 * @returns Number of sides
 */
export const getSidesFromType = (type: DiceType): number => {
  return parseInt(type.substring(1), 10);
};

/**
 * Generate a unique ID for a dice roll
 * @returns Unique ID string
 */
export const generateRollId = (): string => {
  return `roll-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * Format a dice roll result for display
 * @param roll The roll object
 * @returns Formatted string (e.g. "2d6 + 3 = 12 [4, 5] + 3")
 */
export const formatRollResult = (
  type: string,
  results: number[],
  total: number,
  modifier: number
): string => {
  const resultList = results.join(", ");
  const modifierString = modifier !== 0 
    ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) 
    : "";
  
  return `${type} = ${total} [${resultList}]${modifierString}`;
};
