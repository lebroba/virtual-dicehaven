
import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { rollDie } from "@/utils/dice";
import { toast } from "sonner";

const InitiativeTracker: React.FC = () => {
  const { 
    tokens, 
    initiativeOrder, 
    startInitiative, 
    nextTurn, 
    endInitiative, 
    updateToken 
  } = useGame();
  
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
  const [initiativeValue, setInitiativeValue] = useState<string>("");

  const currentTurnToken = initiativeOrder.active && initiativeOrder.currentTurn >= 0
    ? tokens.find(t => t.id === initiativeOrder.order[initiativeOrder.currentTurn]?.tokenId)
    : null;

  const handleInitiativeChange = (tokenId: string, value: string) => {
    setEditingTokenId(tokenId);
    setInitiativeValue(value);
  };

  const handleSaveInitiative = (tokenId: string) => {
    const initiative = parseInt(initiativeValue);
    if (!isNaN(initiative)) {
      updateToken(tokenId, { initiative });
      setEditingTokenId(null);
      toast.success("Initiative updated");
    } else {
      toast.error("Please enter a valid number");
    }
  };

  const handleRollInitiative = (tokenId: string) => {
    const result = rollDie(20);
    updateToken(tokenId, { initiative: result });
    toast(`${tokens.find(t => t.id === tokenId)?.name} rolled ${result} for initiative`);
  };

  const handleRollAllInitiative = () => {
    tokens.forEach(token => {
      const result = rollDie(20);
      updateToken(token.id, { initiative: result });
    });
    toast("Rolled initiative for all tokens");
  };

  const handleStartInitiative = () => {
    const tokensWithInitiative = tokens
      .filter(token => token.initiative !== undefined)
      .map(token => ({
        tokenId: token.id,
        initiative: token.initiative as number
      }));
    
    if (tokensWithInitiative.length === 0) {
      toast.error("No tokens have initiative values");
      return;
    }
    
    startInitiative(tokensWithInitiative);
    toast.success("Combat started!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Initiative Tracker</h3>
        <button
          onClick={handleRollAllInitiative}
          className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          Roll All
        </button>
      </div>
      
      {/* Initiative List */}
      <div className="space-y-2">
        {tokens.length === 0 ? (
          <div className="p-4 bg-secondary/30 rounded-lg text-center text-sm text-muted-foreground">
            Add tokens to the map to track initiative
          </div>
        ) : (
          tokens.map(token => (
            <div 
              key={token.id}
              className={`
                flex items-center justify-between p-2 rounded-lg
                ${currentTurnToken?.id === token.id ? 'bg-primary/20 border-l-4 border-primary' : 'bg-secondary/30'}
              `}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full overflow-hidden border border-border"
                  style={{ backgroundImage: `url(${token.image})`, backgroundSize: 'cover' }}
                />
                <span>{token.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {editingTokenId === token.id ? (
                  <>
                    <input
                      type="number"
                      value={initiativeValue}
                      onChange={(e) => setInitiativeValue(e.target.value)}
                      className="w-14 px-2 py-1 text-center rounded-md border border-input"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveInitiative(token.id)}
                      className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleRollInitiative(token.id)}
                      className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                    >
                      Roll
                    </button>
                    <button
                      onClick={() => {
                        handleInitiativeChange(token.id, token.initiative?.toString() || "0");
                      }}
                      className="w-10 text-center bg-secondary/50 px-2 py-1 rounded-md"
                    >
                      {token.initiative ?? "—"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Combat Controls */}
      <div className="pt-4 border-t border-border space-y-4">
        <h4 className="font-medium">Combat</h4>
        
        {/* Current Turn */}
        {initiativeOrder.active && (
          <div className="bg-primary/10 rounded-lg p-3 animate-pulse">
            <div className="text-sm text-muted-foreground">Current Turn</div>
            <div className="font-bold">{currentTurnToken?.name || "Unknown"}</div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex space-x-3">
          {initiativeOrder.active ? (
            <>
              <button
                onClick={nextTurn}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Next Turn
              </button>
              <button
                onClick={endInitiative}
                className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                End Combat
              </button>
            </>
          ) : (
            <button
              onClick={handleStartInitiative}
              className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              disabled={tokens.length === 0}
            >
              Start Combat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitiativeTracker;
