
import React, { useState, useEffect } from 'react';

interface TerminalTextProps {
  delay?: number;
  className?: string;
}

const TerminalText: React.FC<TerminalTextProps> = ({ delay = 0, className = '' }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);
  
  const terminalLines = [
    '> INITIALIZING TACTICAL SYSTEMS',
    '> LOADING BATTLEFIELD ASSETS',
    '> ESTABLISHING SECURE CONNECTION',
    '> SCANNING AREA FOR HOSTILES',
    '> VERIFYING USER CREDENTIALS',
    '> ALL SYSTEMS OPERATIONAL',
    '> AWAITING COMMAND INPUT'
  ];

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentLineIndex < terminalLines.length) {
          const currentLine = terminalLines[currentLineIndex];
          
          if (charIndex < currentLine.length) {
            setDisplayedText(prev => prev + currentLine.charAt(charIndex));
            setCharIndex(prevCharIndex => prevCharIndex + 1);
          } else {
            setDisplayedText(prev => prev + '\n');
            setCurrentLineIndex(prevLineIndex => prevLineIndex + 1);
            setCharIndex(0);
          }
        } else {
          clearInterval(interval);
        }
      }, 30); // Speed of typing

      return () => {
        clearInterval(interval);
      };
    }, delay);

    return () => clearTimeout(initialDelay);
  }, [currentLineIndex, charIndex, terminalLines, delay]);

  return (
    <pre className={`whitespace-pre-line ${className}`}>
      {displayedText}
      {currentLineIndex < terminalLines.length && <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse ml-1"></span>}
    </pre>
  );
};

export default TerminalText;
