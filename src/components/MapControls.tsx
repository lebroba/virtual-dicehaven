// src/components/MapControls.tsx
import React from 'react';

interface MapControlsProps {
  onLeftClick?: () => void;
  onRightClick?: () => void;
  onUpClick?: () => void;
  onDownClick?: () => void;
  onCenterClick?: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onLeftClick,
  onRightClick,
  onUpClick,
  onDownClick,
  onCenterClick,
}) => {
  return (
    <div className="moveUI">
      <button className="leftarrow" onClick={onLeftClick} aria-label="Pan Left">
        ←
      </button>
      <button className="center" onClick={onCenterClick} aria-label="Reset View">
      ⦿
      </button>
      <button className="rightarrow" onClick={onRightClick} aria-label="Pan Right">
        →
      </button>
      <button className="uparrow" onClick={onUpClick} aria-label="Pan Up">
        ↑
      </button>
      <button className="downarrow" onClick={onDownClick} aria-label="Pan Down">
        ↓
      </button>
    </div>
  );
};

export default MapControls;