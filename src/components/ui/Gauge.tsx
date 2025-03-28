import React, { useState, useRef, useEffect } from "react";

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  size?: number;
  label?: string;
  onChange?: (value: number) => void;
  markerColor?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  min,
  max,
  size = 120,
  label,
  onChange,
  markerColor = "#3b82f6" // Default blue color
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const gaugeRef = useRef<HTMLDivElement>(null);
  
  // Normalize value to angle (0-360 degrees)
  const valueToAngle = (val: number): number => {
    return ((val - min) / (max - min)) * 360;
  };
  
  // Convert angle back to value
  const angleToValue = (angle: number): number => {
    // Normalize angle to 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;
    return min + (normalizedAngle / 360) * (max - min);
  };
  
  // Get marker position for current value
  const getMarkerPosition = (): { x: number, y: number } => {
    const angleRad = (valueToAngle(value) - 90) * (Math.PI / 180);
    const radius = size / 2 - 10; // Offset from edge
    
    return {
      x: radius * Math.cos(angleRad) + radius,
      y: radius * Math.sin(angleRad) + radius,
    };
  };
  
  // Handle mouse/touch events to update value
  const updateValueFromEvent = (clientX: number, clientY: number) => {
    if (!gaugeRef.current || !onChange) return;
    
    const rect = gaugeRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    // Calculate angle from center to pointer position
    const angle = Math.atan2(clientY - center.y, clientX - center.x) * (180 / Math.PI);
    // Convert to 0-360 range
    const normalizedAngle = ((angle + 90) % 360 + 360) % 360;
    
    // Convert angle to value
    const newValue = angleToValue(normalizedAngle);
    onChange(Math.round(newValue));
  };
  
  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValueFromEvent(e.clientX, e.clientY);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateValueFromEvent(e.clientX, e.clientY);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Setup global event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Marker position
  const marker = getMarkerPosition();
  
  // Generate tick marks
  const ticks = [];
  const tickCount = 12; // Every 30 degrees
  for (let i = 0; i < tickCount; i++) {
    const angle = (i * 360) / tickCount;
    const isMajor = i % 3 === 0; // Every 90 degrees is a major tick
    const tickLength = isMajor ? 8 : 5;
    const tickWidth = isMajor ? 2 : 1;
    const angleRad = (angle - 90) * (Math.PI / 180);
    const innerRadius = size / 2 - (isMajor ? 15 : 12);
    const outerRadius = innerRadius - tickLength;
    
    const x1 = innerRadius * Math.cos(angleRad) + size / 2;
    const y1 = innerRadius * Math.sin(angleRad) + size / 2;
    const x2 = outerRadius * Math.cos(angleRad) + size / 2;
    const y2 = outerRadius * Math.sin(angleRad) + size / 2;
    
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isMajor ? "#6b7280" : "#9ca3af"}
        strokeWidth={tickWidth}
      />
    );
    
    // Add labels for major ticks
    if (isMajor) {
      const labelRadius = outerRadius - 10;
      const labelX = labelRadius * Math.cos(angleRad) + size / 2;
      const labelY = labelRadius * Math.sin(angleRad) + size / 2;
      const labelValue = (i / tickCount) * 360;
      
      ticks.push(
        <text
          key={`label-${i}`}
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {labelValue}°
        </text>
      );
    }
  }
  
  return (
    <div 
      className="relative cursor-pointer flex items-center justify-center"
      style={{ width: size, height: size }}
      ref={gaugeRef}
      onMouseDown={handleMouseDown}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="absolute top-0 left-0"
      >
        {/* Gauge background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        
        {/* Tick marks */}
        {ticks}
        
        {/* Marker */}
        <circle
          cx={marker.x}
          cy={marker.y}
          r={6}
          fill={markerColor}
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Line from center to marker */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={marker.x}
          y2={marker.y}
          stroke={markerColor}
          strokeWidth="2"
        />
        
        {/* Center dot */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={3}
          fill="#6b7280"
        />
      </svg>
      
      {/* Label in the center */}
      {label && (
        <div className="relative z-10 text-sm font-medium">
          {label}
        </div>
      )}
    </div>
  );
};