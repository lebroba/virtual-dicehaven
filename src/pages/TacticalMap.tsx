
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getMissions } from '@/lib/missionService';
import { Ship, Mission } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CesiumMap from '@/components/cesium/CesiumMap';
import {
  ChevronLeft,
  Ship as ShipIcon,
  Navigation,
  MapPin,
  Compass,
  Target
} from 'lucide-react';

const TacticalMap: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  
  // Query for missions
  const { data: missions, isLoading: missionsLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: getMissions,
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to access the tactical map.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, loading, navigate, toast]);

  useEffect(() => {
    // For demo purposes, select the first mission
    if (missions && missions.length > 0 && !selectedMission) {
      setSelectedMission(missions[0]);
    }
  }, [missions, selectedMission]);

  // Show loading state
  if (loading || missionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 font-mono text-sm text-muted-foreground">LOADING TACTICAL DATA...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the content (will be redirected by useEffect)
  if (!user) return null;

  // Get mission geographic coordinates based on terrain type
  const getMissionCoordinates = (mission: Mission | null) => {
    if (!mission) return { lat: 32.7157, lon: -117.1611 }; // San Diego Naval Base

    // Map terrain types to geographic regions
    switch (mission.terrain) {
      case 'arctic':
        return { lat: 69.7937, lon: -51.6779 }; // Baffin Bay
      case 'tropical':
        return { lat: 7.5400, lon: 134.5825 }; // Palau
      case 'archipelago':
        return { lat: 38.3046, lon: 26.2950 }; // Aegean Sea
      case 'coastal_waters':
        return { lat: 36.9719, lon: -76.4278 }; // Norfolk Naval Station
      case 'open_ocean':
        return { lat: 25.0000, lon: -71.0000 }; // Bermuda Triangle
      default:
        return { lat: 32.7157, lon: -117.1611 }; // San Diego Naval Base
    }
  };

  const missionCoords = getMissionCoordinates(selectedMission);

  return (
    <div className="min-h-screen bg-background text-foreground dark flex flex-col">
      {/* Header */}
      <header className="glass-panel p-4 border-b border-border relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/command-center')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-mono tracking-tight">TACTICAL MAP</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedMission && (
              <div className="flex items-center bg-primary/10 px-3 py-1 rounded-md">
                <span className="text-sm font-mono text-primary">
                  MISSION: {selectedMission.name}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/mission-selection')}
              className="text-sm"
            >
              <Target className="h-4 w-4 mr-2" />
              Change Mission
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4">
        {/* Tactical map */}
        <div className="flex-grow h-[calc(100vh-8rem)] lg:h-auto overflow-hidden rounded-lg shadow-xl">
          <CesiumMap 
            centerLat={missionCoords.lat}
            centerLon={missionCoords.lon}
            mode="tactical"
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 h-auto lg:h-[calc(100vh-8rem)]">
          <Card className="w-full h-full overflow-hidden glass-panel">
            <div className="p-4 bg-primary/10 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-mono">MISSION INTEL</h2>
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-4rem)]">
              {selectedMission && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-mono text-muted-foreground">MISSION DETAILS</h3>
                    <p className="text-sm">{selectedMission.description}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-mono text-muted-foreground">COORDINATES</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono">LATITUDE</span>
                        </div>
                        <p className="text-sm font-mono mt-1">{missionCoords.lat.toFixed(4)}</p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono">LONGITUDE</span>
                        </div>
                        <p className="text-sm font-mono mt-1">{missionCoords.lon.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-mono text-muted-foreground">MISSION PARAMETERS</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/30 p-2 rounded-md">
                        <span className="text-xs font-mono">TERRAIN</span>
                        <p className="text-sm font-mono mt-1">
                          {selectedMission.terrain.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <span className="text-xs font-mono">WEATHER</span>
                        <p className="text-sm font-mono mt-1">{selectedMission.weather.toUpperCase()}</p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <span className="text-xs font-mono">TIME</span>
                        <p className="text-sm font-mono mt-1">{selectedMission.time_of_day.toUpperCase()}</p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <span className="text-xs font-mono">DIFFICULTY</span>
                        <p className="text-sm font-mono mt-1">LEVEL {selectedMission.difficulty}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-mono text-muted-foreground">OBJECTIVE</h3>
                    <p className="text-sm">{selectedMission.objective}</p>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => toast({
                        title: "Mission System",
                        description: "Mission execution not implemented in this version.",
                      })}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      BEGIN OPERATION
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TacticalMap;
