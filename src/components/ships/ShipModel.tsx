
import React, { useEffect, useRef } from 'react';

interface ShipModelProps {
  modelUrl: string | null;
}

const ShipModel: React.FC<ShipModelProps> = ({ modelUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // In a real implementation, this would load a 3D model
    // For now, we're just showing a placeholder
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(21, 128, 120, 0.3)';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        // Draw ship silhouette
        ctx.fillStyle = 'rgba(21, 128, 120, 0.8)';
        ctx.beginPath();
        
        // Ship outline (simplified Arleigh Burke silhouette)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const shipLength = canvas.width * 0.7;
        const shipWidth = shipLength * 0.12;
        
        ctx.moveTo(centerX - shipLength/2, centerY);
        ctx.lineTo(centerX - shipLength/2 + shipLength * 0.1, centerY - shipWidth/2);
        ctx.lineTo(centerX + shipLength/2 - shipLength * 0.1, centerY - shipWidth/2);
        ctx.lineTo(centerX + shipLength/2, centerY);
        ctx.lineTo(centerX + shipLength/2 - shipLength * 0.1, centerY + shipWidth/2);
        ctx.lineTo(centerX - shipLength/2 + shipLength * 0.1, centerY + shipWidth/2);
        ctx.closePath();
        ctx.fill();
        
        // Superstructure
        ctx.fillStyle = 'rgba(21, 128, 120, 0.6)';
        ctx.beginPath();
        ctx.rect(
          centerX - shipLength * 0.15, 
          centerY - shipWidth * 0.7, 
          shipLength * 0.3, 
          shipWidth * 0.7
        );
        ctx.fill();
        
        // Radar mast
        ctx.fillStyle = 'rgba(21, 128, 120, 0.9)';
        ctx.beginPath();
        ctx.rect(
          centerX - shipLength * 0.05, 
          centerY - shipWidth * 1.2, 
          shipLength * 0.1, 
          shipWidth * 0.5
        );
        ctx.fill();
        
        // Text indicating placeholder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('3D MODEL PLACEHOLDER', centerX, centerY + shipWidth * 1.5);
        
        if (modelUrl) {
          ctx.fillText(`Model: ${modelUrl.split('/').pop()}`, centerX, centerY + shipWidth * 1.8);
        } else {
          ctx.fillText('No model available', centerX, centerY + shipWidth * 1.8);
        }
      }
    }
  }, [modelUrl]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={300} 
      className="w-full h-full object-cover"
    />
  );
};

export default ShipModel;
