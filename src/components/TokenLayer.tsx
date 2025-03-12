
import React from "react";
import { useGame } from "@/context/GameContext";
import { MilitarySymbol } from "@/components/MilitarySymbol";

const TokenLayer: React.FC = () => {
  const { 
    tokens, 
    addToken, 
    updateToken, 
    selectedTokenId, 
    setSelectedTokenId,
    gridSize 
  } = useGame();

  // Handle token drag
  const handleDragStart = (e: React.DragEvent, tokenId: string) => {
    setSelectedTokenId(tokenId);
    e.dataTransfer.setData("tokenId", tokenId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tokenId = e.dataTransfer.getData("tokenId");
    
    if (!tokenId) return;
    
    // Calculate the position based on the drop location
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update the token position
    updateToken(tokenId, {
      x,
      y
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Render each token */}
      {tokens.map((token) => (
        <div
          key={token.id}
          draggable
          onDragStart={(e) => handleDragStart(e, token.id)}
          onClick={() => setSelectedTokenId(token.id)}
          className={`absolute token overflow-hidden cursor-move ${
            selectedTokenId === token.id ? "z-10" : "z-1"
          }`}
          style={{
            left: token.x,
            top: token.y,
            width: token.size,
            height: token.size
          }}
        >
          {token.symbolType ? (
            <MilitarySymbol 
              identity={token.symbolType.identity}
              domain={token.symbolType.domain}
              size={token.size}
              selected={selectedTokenId === token.id}
            />
          ) : (
            <img 
              src={token.image} 
              alt={token.name}
              className="w-full h-full object-cover rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default TokenLayer;
