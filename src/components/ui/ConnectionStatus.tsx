import React, { useEffect, useState } from 'react';
import { Badge } from './badge';
import webSocketService, { ConnectionStatus } from '../../utils/WebSocketService';

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatusIndicator({ className }: ConnectionStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>(
    webSocketService.getConnectionStatus() as ConnectionStatus
  );
  const [reconnectInfo, setReconnectInfo] = useState<{
    attempt?: number;
    maxAttempts?: number;
  } | null>(null);

  useEffect(() => {
    // Update status when component mounts
    setStatus(webSocketService.getConnectionStatus() as ConnectionStatus);

    // Listen for connection changes
    const handleConnectionChange = (data: {
      status: ConnectionStatus;
      attempt?: number;
      maxAttempts?: number;
    }) => {
      setStatus(data.status);
      if (data.status === 'reconnecting' && data.attempt && data.maxAttempts) {
        setReconnectInfo({
          attempt: data.attempt,
          maxAttempts: data.maxAttempts,
        });
      } else {
        setReconnectInfo(null);
      }
    };

    webSocketService.on('connectionChange', handleConnectionChange);

    return () => {
      webSocketService.off('connectionChange', handleConnectionChange);
    };
  }, []);

  // Determine badge variant based on status
  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'connected':
        return 'default'; // Using default (primary color) for connected
      case 'connecting':
      case 'reconnecting':
        return 'secondary'; // Using secondary for connecting/reconnecting
      case 'disconnected':
      case 'closed':
      default:
        return 'destructive'; // Using destructive for disconnected/closed
    }
  };

  // Format status text
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return reconnectInfo
          ? `Reconnecting (${reconnectInfo.attempt}/${reconnectInfo.maxAttempts})...`
          : 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'closed':
        return 'Connection Closed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center ${className || ''}`}>
      <Badge variant={getBadgeVariant()}>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting' || status === 'reconnecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
          <span>{getStatusText()}</span>
        </div>
      </Badge>
    </div>
  );
}