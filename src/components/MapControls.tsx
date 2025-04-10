
import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  onCenterClick
}) => {
  // Safely handle button clicks with null checks
  const handleLeftClick = () => {
    if (onLeftClick) onLeftClick();
  };

  const handleRightClick = () => {
    if (onRightClick) onRightClick();
  };

  const handleUpClick = () => {
    if (onUpClick) onUpClick();
  };

  const handleDownClick = () => {
    if (onDownClick) onDownClick();
  };

  const handleCenterClick = () => {
    if (onCenterClick) onCenterClick();
  };

  return (
    <div className="flex flex-col items-center gap-1 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-md">
      <Button variant="ghost" size="icon" onClick={handleUpClick} className="h-8 w-8">
        <ArrowUp size={16} />
      </Button>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={handleLeftClick} className="h-8 w-8">
          <ArrowLeft size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleCenterClick} className="h-8 w-8">
          <Target size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleRightClick} className="h-8 w-8">
          <ArrowRight size={16} />
        </Button>
      </div>
      <Button variant="ghost" size="icon" onClick={handleDownClick} className="h-8 w-8">
        <ArrowDown size={16} />
      </Button>
    </div>
  );
};

export default MapControls;
