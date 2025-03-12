
import React from 'react';

export type SymbolIdentity = 'pending' | 'unknown' | 'friend' | 'neutral' | 'hostile' | 'assumed-friend' | 'suspect';
export type SymbolDomain = 'unknown' | 'space' | 'air' | 'land-unit' | 'land-equipment' | 'sea-surface' | 'land-installation' | 'subsurface' | 'activity' | 'cyberspace';

interface MilitarySymbolProps {
  identity: SymbolIdentity;
  domain: SymbolDomain;
  size?: number;
  selected?: boolean;
  className?: string;
}

export function MilitarySymbol({ 
  identity, 
  domain, 
  size = 40, 
  selected = false,
  className = ''
}: MilitarySymbolProps) {
  // Get the fill color based on identity
  const getFillColor = () => {
    switch (identity) {
      case 'friend':
      case 'assumed-friend':
        return '#88CCEE'; // Blue
      case 'hostile':
      case 'suspect':
        return '#EE8888'; // Red
      case 'neutral':
        return '#88EE88'; // Green
      case 'pending':
      case 'unknown':
      default:
        return '#EEEE88'; // Yellow
    }
  };
  
  // Get the stroke style based on identity certainty
  const getStrokeStyle = () => {
    if (identity === 'assumed-friend' || identity === 'suspect') {
      return 'stroke-dasharray: 5,5;';
    }
    return '';
  };
  
  // Get the symbol path based on domain
  const getSymbolPath = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4; // 80% of size for diameter
    
    switch (domain) {
      case 'unknown':
        // Question mark symbol
        return (
          identity === 'hostile' || identity === 'suspect' ? 
          <rect 
            x={centerX - radius}
            y={centerY - radius}
            width={radius * 2}
            height={radius * 2} 
            fill={getFillColor()}
            stroke="#000000"
            strokeWidth="2"
            transform={`rotate(45 ${centerX} ${centerY})`}
            style={{ strokeDasharray: getStrokeStyle() }}
          /> :
          <circle 
            cx={centerX}
            cy={centerY}
            r={radius} 
            fill={getFillColor()}
            stroke="#000000"
            strokeWidth="2"
            style={{ strokeDasharray: getStrokeStyle() }}
          />
        );
      
      case 'air':
        // Air symbol (pointed arch)
        return (
          <path
            d={`M ${centerX - radius} ${centerY + radius} C ${centerX - radius} ${centerY - radius * 0.8}, ${centerX + radius} ${centerY - radius * 0.8}, ${centerX + radius} ${centerY + radius}`}
            fill={getFillColor()}
            stroke="#000000"
            strokeWidth="2"
            style={{ strokeDasharray: getStrokeStyle() }}
          />
        );
      
      case 'space':
        // Space symbol (pointed arch with top line)
        return (
          <>
            <path
              d={`M ${centerX - radius} ${centerY + radius} C ${centerX - radius} ${centerY - radius * 0.8}, ${centerX + radius} ${centerY - radius * 0.8}, ${centerX + radius} ${centerY + radius}`}
              fill={getFillColor()}
              stroke="#000000"
              strokeWidth="2"
              style={{ strokeDasharray: getStrokeStyle() }}
            />
            <line 
              x1={centerX - radius * 0.8} 
              y1={centerY - radius * 0.6} 
              x2={centerX + radius * 0.8} 
              y2={centerY - radius * 0.6}
              stroke="#000000"
              strokeWidth="2"
            />
          </>
        );
      
      case 'land-unit':
        // Land Unit symbol (rectangle)
        return (
          <rect 
            x={centerX - radius}
            y={centerY - radius}
            width={radius * 2}
            height={radius * 2} 
            fill={getFillColor()}
            stroke="#000000"
            strokeWidth="2"
            style={{ strokeDasharray: getStrokeStyle() }}
          />
        );
      
      case 'sea-surface':
      case 'land-equipment':
        // Sea Surface/Land Equipment symbol (circle)
        return (
          <circle 
            cx={centerX}
            cy={centerY}
            r={radius} 
            fill={getFillColor()}
            stroke="#000000"
            strokeWidth="2"
            style={{ strokeDasharray: getStrokeStyle() }}
          />
        );
      
      case 'land-installation':
        // Land Installation symbol (rectangle with top line)
        return (
          <>
            <rect 
              x={centerX - radius}
              y={centerY - radius}
              width={radius * 2}
              height={radius * 2} 
              fill={getFillColor()}
              stroke="#000000"
              strokeWidth="2"
              style={{ strokeDasharray: getStrokeStyle() }}
            />
            <line 
              x1={centerX - radius} 
              y1={centerY - radius * 0.6} 
              x2={centerX + radius} 
              y2={centerY - radius * 0.6}
              stroke="#000000"
              strokeWidth="2"
            />
          </>
        );
      
      case 'subsurface':
        // Subsurface symbol (arch/semicircle)
        return (
          <path
            d={`M ${centerX - radius} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY - radius} V ${centerY + radius} H ${centerX - radius} Z`}
            fill={getFillColor()}
            stroke="#000000"
            strokeWidth="2"
            style={{ strokeDasharray: getStrokeStyle() }}
          />
        );
      
      case 'activity':
        // Activity symbol (rectangle with dashed border)
        return (
          <rect 
            x={centerX - radius}
            y={centerY - radius}
            width={radius * 2}
            height={radius * 2} 
            fill={getFillColor()}
            stroke="#000000"
            strokeWidth="2"
            strokeDasharray="5,5"
            style={{ strokeDasharray: getStrokeStyle() }}
          />
        );
      
      case 'cyberspace':
        // Cyberspace symbol (rectangle with right angle)
        return (
          <>
            <rect 
              x={centerX - radius}
              y={centerY - radius}
              width={radius * 2}
              height={radius * 2} 
              fill={getFillColor()}
              stroke="#000000"
              strokeWidth="2"
              style={{ strokeDasharray: getStrokeStyle() }}
            />
            <line 
              x1={centerX + radius} 
              y1={centerY - radius} 
              x2={centerX + radius} 
              y2={centerY + radius}
              stroke="#000000"
              strokeWidth="2"
            />
          </>
        );
      
      default:
        // Default to a question mark symbol
        return (
          <circle 
            cx={centerX}
            cy={centerY}
            r={radius} 
            fill={getFillColor()}
            stroke="#000000"
            strokeWidth="2"
            style={{ strokeDasharray: getStrokeStyle() }}
          />
        );
    }
  };
  
  // Special handling for suspected/assumed
  const isDashed = identity === 'assumed-friend' || identity === 'suspect';
  
  // Special handling for hostile/suspect
  const isDiamond = (identity === 'hostile' || identity === 'suspect') && domain !== 'unknown';
  
  // Determine the frame shape based on identity
  const getFrame = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const frameRadius = size * 0.45; // Slightly larger than the symbol
    
    if (isDiamond) {
      // Diamond shape for hostile/suspect
      return (
        <rect 
          x={centerX - frameRadius}
          y={centerY - frameRadius}
          width={frameRadius * 2}
          height={frameRadius * 2} 
          fill="none"
          stroke={selected ? "#ffffff" : "none"}
          strokeWidth="1.5"
          transform={`rotate(45 ${centerX} ${centerY})`}
          style={{ strokeDasharray: isDashed ? "5,5" : "" }}
        />
      );
    } else {
      // Circle for friendly/neutral/unknown
      return (
        <circle 
          cx={centerX}
          cy={centerY}
          r={frameRadius}
          fill="none"
          stroke={selected ? "#ffffff" : "none"}
          strokeWidth="1.5"
          style={{ strokeDasharray: isDashed ? "5,5" : "" }}
        />
      );
    }
  };
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`} 
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Selection indicator */}
      {getFrame()}
      
      {/* The actual military symbol */}
      {getSymbolPath()}
      
      {/* Question mark for unknown frame if domain is 'unknown' */}
      {domain === 'unknown' && (
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#000000"
        >
          ?
        </text>
      )}
    </svg>
  );
}
