
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
    // Create a square grid
    const rows = Math.ceil(height / gridSize);
    const cols = Math.ceil(width / gridSize);

    // Create horizontal lines
    const horizontalLines = Array.from({ length: rows + 1 }, (_, i) => (
      <line
        key={`h-${i}`}
        x1="0"
        y1={i * gridSize}
        x2={width}
        y2={i * gridSize}
        className="stroke-[#0A5C8C] stroke-[1px]"
      />
    ));

    // Create vertical lines
    const verticalLines = Array.from({ length: cols + 1 }, (_, i) => (
      <line
        key={`v-${i}`}
        x1={i * gridSize}
        y1="0"
        x2={i * gridSize}
        y2={height}
        className="stroke-[#0A5C8C] stroke-[1px]"
      />
    ));

    return (
      <svg
        className="absolute inset-0 pointer-events-none bg-transparent"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="fill-transparent">
          {horizontalLines}
          {verticalLines}
        </g>
      </svg>
    );
  }

  // Hexagonal grid
  if (gridType === "hex") {
    const hexWidth = gridSize * Math.sqrt(3);
    const hexHeight = gridSize * 2;
    const rows = Math.ceil(height / (hexHeight * 0.75));
    const cols = Math.ceil(width / hexWidth);

    const hexagons = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isEvenRow = row % 2 === 0;
        const x = col * hexWidth + (isEvenRow ? 0 : hexWidth / 2);
        const y = row * (hexHeight * 0.75);
        
        // Calculate the points of the hexagon
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
            className=""
          />
        );
      }
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none bg-transparent"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        {hexagons}
      </svg>
    );
  }

  return null;
};

export default GridOverlay;
