import React, { createContext, useState, useContext, ReactNode } from "react";
import { SymbolDomain, SymbolIdentity } from "@/components/MilitarySymbol";

export type SymbolType = {
  identity: SymbolIdentity;
  domain: SymbolDomain;
};

export type TokenType = {
  id: string;
  name: string;
  image: string;
  x: number;
  y: number;
  size: number;
  controlledBy: string;
  visible: boolean;
  conditions: string[];
  initiative?: number;
  symbolType?: SymbolType;
};

export type GridType = "square" | "hex" | "none";

export type MapType = {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
  gridSize: number;
  gridType: GridType;
  tokens: TokenType[];
  fogOfWar: boolean[][];
};

export type DiceRollType = {
  id: string;
  type: string;
  result: number;
  sides: number;
  roller: string;
  timestamp: number;
};

export type ChatMessageType = {
  id: string;
  sender: string;
  content: string;
  type: "text" | "roll" | "emote" | "system";
  timestamp: number;
};

export type InitiativeOrderType = {
  active: boolean;
  currentTurn: number;
  order: {
    tokenId: string;
    initiative: number;
  }[];
};

type GameContextType = {
  currentMap: MapType | null;
  setCurrentMap: (map: MapType) => void;
  tokens: TokenType[];
  addToken: (token: TokenType) => void;
  updateToken: (id: string, updates: Partial<TokenType>) => void;
  removeToken: (id: string) => void;
  selectedTokenId: string | null;
  setSelectedTokenId: (id: string | null) => void;
  diceRolls: DiceRollType[];
  addDiceRoll: (roll: DiceRollType) => void;
  chatMessages: ChatMessageType[];
  addChatMessage: (message: ChatMessageType) => void;
  initiativeOrder: InitiativeOrderType;
  startInitiative: (order: { tokenId: string; initiative: number }[]) => void;
  nextTurn: () => void;
  endInitiative: () => void;
  gridType: GridType;
  setGridType: (type: GridType) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
};

const defaultInitiativeOrder: InitiativeOrderType = {
  active: false,
  currentTurn: -1,
  order: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMap, setCurrentMap] = useState<MapType | null>(null);
  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [diceRolls, setDiceRolls] = useState<DiceRollType[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [initiativeOrder, setInitiativeOrder] = useState<InitiativeOrderType>(defaultInitiativeOrder);
  const [gridType, setGridType] = useState<GridType>("square");
  const [gridSize, setGridSize] = useState<number>(50);

  const addToken = (token: TokenType) => {
    setTokens((prev) => [...prev, token]);
  };

  const updateToken = (id: string, updates: Partial<TokenType>) => {
    setTokens((prev) =>
      prev.map((token) => (token.id === id ? { ...token, ...updates } : token))
    );
  };

  const removeToken = (id: string) => {
    setTokens((prev) => prev.filter((token) => token.id !== id));
  };

  const addDiceRoll = (roll: DiceRollType) => {
    setDiceRolls((prev) => [roll, ...prev].slice(0, 20)); // Keep only the last 20 rolls
    
    // Add a chat message for the roll
    const message: ChatMessageType = {
      id: `roll-${roll.id}`,
      sender: roll.roller,
      content: `Rolled ${roll.result} on a ${roll.sides}-sided die (${roll.type})`,
      type: "roll",
      timestamp: roll.timestamp,
    };
    
    addChatMessage(message);
  };

  const addChatMessage = (message: ChatMessageType) => {
    setChatMessages((prev) => [message, ...prev].slice(0, 50)); // Keep only the last 50 messages
  };

  const startInitiative = (order: { tokenId: string; initiative: number }[]) => {
    // Sort by initiative in descending order
    const sortedOrder = [...order].sort((a, b) => b.initiative - a.initiative);
    
    setInitiativeOrder({
      active: true,
      currentTurn: 0,
      order: sortedOrder,
    });

    // Add system message
    addChatMessage({
      id: `system-${Date.now()}`,
      sender: "System",
      content: "Initiative order has started",
      type: "system",
      timestamp: Date.now(),
    });
  };

  const nextTurn = () => {
    if (!initiativeOrder.active) return;
    
    setInitiativeOrder((prev) => {
      const newTurn = (prev.currentTurn + 1) % prev.order.length;
      const nextToken = tokens.find(t => t.id === prev.order[newTurn].tokenId);
      
      // Add system message for next turn
      if (nextToken) {
        addChatMessage({
          id: `system-${Date.now()}`,
          sender: "System",
          content: `It's ${nextToken.name}'s turn`,
          type: "system",
          timestamp: Date.now(),
        });
      }
      
      return {
        ...prev,
        currentTurn: newTurn,
      };
    });
  };

  const endInitiative = () => {
    setInitiativeOrder(defaultInitiativeOrder);
    
    // Add system message
    addChatMessage({
      id: `system-${Date.now()}`,
      sender: "System",
      content: "Initiative order has ended",
      type: "system",
      timestamp: Date.now(),
    });
  };

  return (
    <GameContext.Provider
      value={{
        currentMap,
        setCurrentMap,
        tokens,
        addToken,
        updateToken,
        removeToken,
        selectedTokenId,
        setSelectedTokenId,
        diceRolls,
        addDiceRoll,
        chatMessages,
        addChatMessage,
        initiativeOrder,
        startInitiative,
        nextTurn,
        endInitiative,
        gridType,
        setGridType,
        gridSize,
        setGridSize,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
