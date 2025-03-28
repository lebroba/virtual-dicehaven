import React from "react";
import { useGame } from "@/context/GameContext";
import { Tooltip } from "@/components/ui/tooltip";

// Sample token images
const tokenImages = ["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=200&h=200&fit=crop", "https://images.unsplash.com/photo-1613987549117-13c4783dfc30?w=200&h=200&fit=crop", "https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=200&h=200&fit=crop", "https://images.unsplash.com/photo-1653167834535-82910de1681e?w=200&h=200&fit=crop"];
const TokenLayer: React.FC = () => {
  const {
    tokens,
    addToken,
    updateToken,
    selectedTokenId,
    setSelectedTokenId,
    gridSize,
    selectedTool
  } = useGame();

  // Add a new token at a random position
  const handleAddToken = () => {
    const id = `token-${Date.now()}`;
    const randomImage = tokenImages[Math.floor(Math.random() * tokenImages.length)];
    addToken({
      id,
      name: `Token ${tokens.length + 1}`,
      image: randomImage,
      x: Math.random() * 800,
      y: Math.random() * 600,
      size: gridSize,
      controlledBy: "player",
      visible: true,
      conditions: []
    });
  };

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
    // This is a simplified approach - in a real app, you'd 
    // calculate this relative to the map container
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
      onDrop={handleDrop} 
      onDragOver={handleDragOver} 
      className={`absolute inset-0 ${selectedTokenId || selectedTool === 'select' ? 'pointer-events-auto' : 'pointer-events-none'} bg-transparent`}
      style={{ zIndex: 10 }} // Higher than map, lower than UI
    >
      {/* Render each token */}
      {tokens.map(token => (
        <div 
          key={token.id} 
          draggable 
          onDragStart={e => handleDragStart(e, token.id)} 
          onClick={() => setSelectedTokenId(token.id)} 
          className={`absolute token rounded-full overflow-hidden ${
            selectedTokenId === token.id ? "ring-2 ring-primary animate-ping-slow" : ""
          }`} 
          style={{
            left: token.x,
            top: token.y,
            width: token.size,
            height: token.size,
            zIndex: selectedTokenId === token.id ? 15 : 10
          }}
        >
          <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
        </div>
      ))}
      
      {/* Token controls */}
      <div className="absolute top-4 right-4 glass-panel p-2 rounded-lg bg-transparent">
        {/* Token layer controls could go here */}
      </div>
    </div>
  );
};
export default TokenLayer;