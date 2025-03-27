import React from "react";
import { GridType } from "@/context/GameContext";

interface GridOverlayProps {
  width: number;
  height: number;
  gridSize: number;
  gridType: GridType;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ width, height, gridSize, gridType }) => {
  if (gridType === "none") {
    return null;
  }

  if (gridType === "square") {
    const rows = Math.floor(height / gridSize);
    const cols = Math.floor(width / gridSize);
    const clampedWidth = cols * gridSize;
    const clampedHeight = rows * gridSize;

    const horizontalLines = Array.from({ length: rows + 1 }, (_, i) => (
      <line
        key={`h-${i}`}
        x1="0"
        y1={i * gridSize}
        x2={clampedWidth}
        y2={i * gridSize}
        stroke="#0A5C8C"
        strokeWidth="1"
      />
    ));

    const verticalLines = Array.from({ length: cols + 1 }, (_, i) => (
      <line
        key={`v-${i}`}
        x1={i * gridSize}
        y1="0"
        x2={i * gridSize}
        y2={clampedHeight}
        stroke="#0A5C8C"
        strokeWidth="1"
      />
    ));

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: 'transparent' }} // Explicitly set transparent background
      >
        <g fill="none"> {/* Ensure no fill on the group */}
          {horizontalLines}
          {verticalLines}
        </g>
      </svg>
    );
  }

  if (gridType === "hex") {
    const hexWidth = gridSize * Math.sqrt(3);
    const hexHeight = gridSize * 2;
    const rows = Math.floor(height / (hexHeight * 0.75));
    const cols = Math.floor(width / hexWidth);

    const hexagons = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isEvenRow = row % 2 === 0;
        const x = col * hexWidth + (isEvenRow ? 0 : hexWidth / 2);
        const y = row * (hexHeight * 0.75);
        
        if (x + hexWidth <= width && y + hexHeight <= height) {
          const points = [
            [x + hexWidth/2, y],
            [x + hexWidth, y + hexHeight/4],
            [x + hexWidth, y + hexHeight*3/4],
            [x + hexWidth/2, y + hexHeight],
            [x, y + hexHeight*3/4],
            [x, y + hexHeight/4],
          ].map(point => point.join(',')).join(' ');
          
          hexagons.push(
            <polygon
              key={`hex-${row}-${col}`}
              points={points}
              stroke="#0A5C8C"
              strokeWidth="1"
              fill="none" // Explicitly set no fill
            />
          );
        }
      }
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: 'transparent' }} // Explicitly set transparent background
      >
        {hexagons}
      </svg>
    );
  }

  return null;
};

export default GridOverlay;