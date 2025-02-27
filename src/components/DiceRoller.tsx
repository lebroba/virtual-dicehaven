
import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { DiceType, rollDie, rollFromNotation, getSidesFromType, generateRollId, formatRollResult } from "@/utils/dice";
import { toast } from "sonner";

const DiceRoller: React.FC = () => {
  const { addDiceRoll } = useGame();
  const [customNotation, setCustomNotation] = useState("1d20");
  const [animatingDice, setAnimatingDice] = useState<string | null>(null);

  const diceTypes: DiceType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

  const handleRollDie = (type: DiceType) => {
    setAnimatingDice(type);
    
    // Get the number of sides from the dice type
    const sides = getSidesFromType(type);
    
    // Roll the die
    const result = rollDie(sides);
    
    // Create a roll object
    const rollId = generateRollId();
    
    setTimeout(() => {
      setAnimatingDice(null);
      
      // Add the roll to the game state
      addDiceRoll({
        id: rollId,
        type,
        result,
        sides,
        roller: "Player",
        timestamp: Date.now(),
      });
      
      // Show a toast with the result
      toast(`Rolled ${result} on ${type}`);
    }, 800);
  };

  const handleRollCustom = () => {
    try {
      setAnimatingDice("custom");
      
      setTimeout(() => {
        setAnimatingDice(null);
        
        // Roll based on the custom notation
        const { results, total, modifier, sides, count } = rollFromNotation(customNotation);
        
        // Create a roll object
        const rollId = generateRollId();
        
        // Add the roll to the game state
        addDiceRoll({
          id: rollId,
          type: customNotation,
          result: total,
          sides,
          roller: "Player",
          timestamp: Date.now(),
        });
        
        // Show a toast with the result
        toast(formatRollResult(customNotation, results, total, modifier));
      }, 800);
    } catch (error) {
      toast.error("Invalid dice notation");
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-medium mb-4">Roll Dice</h3>
        <div className="grid grid-cols-3 gap-3">
          {diceTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleRollDie(type)}
              className={`
                flex flex-col items-center justify-center p-3 
                bg-secondary/70 hover:bg-secondary/90 
                rounded-lg shadow transition-all duration-200 
                ${animatingDice === type ? 'animate-dice-roll' : ''}
              `}
            >
              <span className="text-lg font-bold">{type}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Custom Roll</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customNotation}
            onChange={(e) => setCustomNotation(e.target.value)}
            placeholder="e.g. 2d6+3"
            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
          />
          <button
            onClick={handleRollCustom}
            className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
              animatingDice === "custom" ? 'animate-dice-roll' : ''
            }`}
          >
            Roll
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Format: [number of dice]d[sides]±[modifier] (e.g. 2d6+3)
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quick Roll</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setCustomNotation("1d20");
              handleRollCustom();
            }}
            className="px-3 py-2 bg-secondary/70 hover:bg-secondary/90 rounded-md text-sm"
          >
            Ability Check (d20)
          </button>
          <button
            onClick={() => {
              setCustomNotation("1d20+5");
              handleRollCustom();
            }}
            className="px-3 py-2 bg-secondary/70 hover:bg-secondary/90 rounded-md text-sm"
          >
            Skill Check (+5)
          </button>
          <button
            onClick={() => {
              setCustomNotation("1d20+7");
              handleRollCustom();
            }}
            className="px-3 py-2 bg-secondary/70 hover:bg-secondary/90 rounded-md text-sm"
          >
            Attack Roll (+7)
          </button>
          <button
            onClick={() => {
              setCustomNotation("2d6+3");
              handleRollCustom();
            }}
            className="px-3 py-2 bg-secondary/70 hover:bg-secondary/90 rounded-md text-sm"
          >
            Damage (2d6+3)
          </button>
          <button
            onClick={() => {
              setCustomNotation("8d6");
              handleRollCustom();
            }}
            className="px-3 py-2 bg-secondary/70 hover:bg-secondary/90 rounded-md text-sm"
          >
            Fireball (8d6)
          </button>
          <button
            onClick={() => {
              setCustomNotation("4d10");
              handleRollCustom();
            }}
            className="px-3 py-2 bg-secondary/70 hover:bg-secondary/90 rounded-md text-sm"
          >
            Critical (4d10)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiceRoller;
