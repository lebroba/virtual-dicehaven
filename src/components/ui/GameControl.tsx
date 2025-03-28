import React, { useState, useEffect } from 'react';
import { Button } from "./button";

const GameControl: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000 / speedMultiplier);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, speedMultiplier]);

  const handlePlay = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };

  const handleFastForward = () => {
    setSpeedMultiplier(prev => Math.min(prev + 1, 5));
  };

  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m:${String(seconds).padStart(2, '0')}s`;
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Game Controls</h3>
      <div className="mb-4 text-center">
        <span className="font-mono">{formatTime(elapsedTime)}</span>
        {speedMultiplier > 1 && (
          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            {speedMultiplier}x
          </span>
        )}
      </div>
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-2">
          <Button 
            variant={isRunning ? "secondary" : "default"}
            onClick={handlePlay}
            disabled={isRunning}
          >
            Play
          </Button>
          <Button 
            variant="secondary"
            onClick={handlePause}
            disabled={!isRunning}
          >
            Pause
          </Button>
          <Button 
            variant="destructive"
            onClick={handleStop}
          >
            Stop
          </Button>
          <Button 
            variant="default"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handleFastForward}
            disabled={speedMultiplier >= 5}
          >
            Fast Forward
          </Button>
        </div>
        <div>
          <label htmlFor="speedSlider" className="block text-sm font-medium mb-1">Speed: {speedMultiplier}x</label>
          <input 
            type="range" 
            id="speedSlider" 
            min="1" 
            max="5" 
            step="1"
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
            className="w-full" 
          />
        </div>
      </div>
    </div>
  );
};

export default GameControl;