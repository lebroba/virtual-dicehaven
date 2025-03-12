// This is now just a simpler wrapper around CesiumViewer
// It's kept as a separate component for backward compatibility
import React from 'react';
import CesiumViewer from './CesiumViewer';

interface CesiumMapProps {
  height?: string;
}

export const CesiumMap: React.FC<CesiumMapProps> = () => {
  // Pass height="100%" to CesiumViewer to mark it as being used in map mode
  // This will make CesiumViewer adjust its UI accordingly
  return <CesiumViewer className="h-full" />;
};

export default CesiumMap;
