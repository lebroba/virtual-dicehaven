
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getMissions, initializeMissions, updateMissionConfig } from '@/lib/missionService';
import { Mission, MissionType } from '@/types/supabase';
import { getShipById } from '@/lib/shipService';
import MissionCard from '@/components/missions/MissionCard';
import MissionDetails from '@/components/missions/MissionDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, Navigation, Anchor, Swords, FileStack, ChevronLeft } from 'lucide-react';
import AuthButton from '@/components/auth/AuthButton';
import { toast } from 'sonner';

const MissionSelection: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: uiToast } = useToast();
  
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionFilter, setMissionFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  
  // Get the ship ID from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shipId = params.get('shipId');
    if (shipId) {
      setSelectedShipId(shipId);
    }
  }, [location]);
  
  // Check if ship is selected
  useEffect(() => {
    const checkShip = async () => {
      if (!selectedShipId) {
        toast.error('No ship selected', {
          description: 'Please select a ship before configuring a mission.',
        });
        navigate('/ship-selection');
      } else {
        try {
          // Verify that the ship exists
          const ship = await getShipById(selectedShipId);
          if (!ship) {
            toast.error('Invalid ship', {
              description: 'The selected ship could not be found.',
            });
            navigate('/ship-selection');
          }
        } catch (error) {
          console.error('Error checking ship:', error);
          toast.error('Error loading ship', {
            description: 'There was an error loading the selected ship.',
          });
          navigate('/ship-selection');
        }
      }
    };
    
    if (!loading) {
      checkShip();
    }
  }, [selectedShipId, loading, navigate]);
  
  // Fetch missions when component mounts
  useEffect(() => {
    const loadMissions = async () => {
      try {
        setIsLoading(true);
        
        // Initialize missions if needed
        await initializeMissions();
        
        // Get missions
        const fetchedMissions = await getMissions();
        setMissions(fetchedMissions);
        setFilteredMissions(fetchedMissions);
        
        // Set default selected mission
        if (fetchedMissions.length > 0) {
          setSelectedMission(fetchedMissions[0]);
        }
      } catch (error) {
        console.error('Error loading missions:', error);
        uiToast({
          title: 'Error',
          description: 'Failed to load mission data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMissions();
  }, [uiToast]);
  
  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      uiToast({
        title: 'Authentication Required',
        description: 'You must be logged in to access mission selection.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, loading, navigate, uiToast]);
  
  // Filter missions
  useEffect(() => {
    if (missionFilter === 'all') {
      setFilteredMissions(missions);
    } else {
      setFilteredMissions(missions.filter(mission => mission.type === missionFilter));
    }
  }, [missions, missionFilter]);
  
  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission);
  };
  
  const handleConfigureMission = async (mission: Mission) => {
    try {
      const updatedMission = await updateMissionConfig(mission.id, {
        difficulty: mission.difficulty,
        weather: mission.weather,
        time_of_day: mission.time_of_day,
        terrain: mission.terrain,
      });
      
      if (updatedMission) {
        // Update missions list
        setMissions(missions.map(m => m.id === updatedMission.id ? updatedMission : m));
        // Update selected mission
        setSelectedMission(updatedMission);
      }
    } catch (error) {
      console.error('Error configuring mission:', error);
      uiToast({
        title: 'Configuration Error',
        description: 'Failed to update mission configuration.',
        variant: 'destructive',
      });
    }
  };
  
  const handleStartMission = (mission: Mission) => {
    toast.success('Mission Prepared', {
      description: `${mission.name} is ready for deployment with ${mission.weather} conditions.`,
    });
    // In a real implementation, this would navigate to the mission deployment screen
    // For now, just navigate back to the command center
    navigate('/command-center');
  };
  
  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 font-mono text-sm text-muted-foreground">LOADING MISSION DATABASE...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, don't render anything (will be redirected by useEffect)
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-background text-foreground dark flex flex-col">
      {/* Header */}
      <header className="glass-panel p-4 border-b border-border relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/assets/hellhound-icon.svg" 
                alt="Hellhound icon" 
                className="h-8 w-auto"
              />
              <img 
                src="/assets/text-logo.svg" 
                alt="Dicehaven" 
                className="h-6 w-auto"
              />
            </div>
            <div className="h-6 border-l border-border"></div>
            <div className="flex items-center">
              <FileStack className="h-4 w-4 mr-2 text-primary" />
              <h1 className="text-lg font-mono tracking-tight">MISSION SELECTION</h1>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/ship-selection')}
              className="font-mono text-xs flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              SHIP SELECTION
            </Button>
            <AuthButton />
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto p-4 flex gap-6">
        {/* Mission listing */}
        <div className="w-1/3 glass-panel rounded-lg p-4 border border-border">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-mono tracking-tight flex items-center">
              <FileStack className="h-4 w-4 mr-2 text-primary" />
              MISSIONS
            </h2>
            
            <Tabs defaultValue="all" value={missionFilter} onValueChange={setMissionFilter}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs">ALL</TabsTrigger>
                <TabsTrigger value="coastal_defense" className="text-xs p-0 w-8">
                  <Shield className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="patrol" className="text-xs p-0 w-8">
                  <Navigation className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="escort" className="text-xs p-0 w-8">
                  <Anchor className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="combat" className="text-xs p-0 w-8">
                  <Swords className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            {filteredMissions.length === 0 ? (
              <p className="text-center text-muted-foreground font-mono text-sm">
                No missions available
              </p>
            ) : (
              filteredMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onClick={() => handleMissionSelect(mission)}
                  selected={selectedMission?.id === mission.id}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Mission details */}
        <div className="w-2/3 glass-panel rounded-lg p-4 border border-border h-[calc(100vh-8rem)] flex flex-col">
          {selectedMission ? (
            <MissionDetails 
              mission={selectedMission} 
              onConfigureMission={handleConfigureMission}
              onStartMission={handleStartMission}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-muted-foreground font-mono">
                Select a mission to view details
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MissionSelection;
