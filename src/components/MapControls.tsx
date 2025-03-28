// src/components/MapControls.tsx
import React, { useEffect } from 'react';

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
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid scrolling the page
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
      }
      
      // Map key presses to the appropriate handlers
      switch (event.key) {
        case 'ArrowLeft':
          onLeftClick?.();
          break;
        case 'ArrowRight':
          onRightClick?.();
          break;
        case 'ArrowUp':
          onUpClick?.();
          break;
        case 'ArrowDown':
          onDownClick?.();
          break;
        case 'c':
        case 'C':
          // Check if Shift key is pressed for Shift+C combination
          if (event.shiftKey) {
            onCenterClick?.();
          }
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onLeftClick, onRightClick, onUpClick, onDownClick, onCenterClick]);

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