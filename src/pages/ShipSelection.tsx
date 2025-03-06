
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getShips, toggleShipSystem, initializeShips } from '@/lib/shipService';
import { Ship } from '@/types/supabase';
import ShipCard from '@/components/ships/ShipCard';
import ShipDetails from '@/components/ships/ShipDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Ship as ShipIcon, Filter, ChevronLeft } from 'lucide-react';
import AuthButton from '@/components/auth/AuthButton';

const ShipSelection: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ships, setShips] = useState<Ship[]>([]);
  const [filteredShips, setFilteredShips] = useState<Ship[]>([]);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [shipFilter, setShipFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch ships when component mounts
  useEffect(() => {
    const loadShips = async () => {
      try {
        setIsLoading(true);
        
        // Initialize ships if needed
        await initializeShips();
        
        // Get ships
        const fetchedShips = await getShips();
        setShips(fetchedShips);
        setFilteredShips(fetchedShips);
        
        // Set default selected ship
        if (fetchedShips.length > 0) {
          setSelectedShip(fetchedShips[0]);
        }
      } catch (error) {
        console.error('Error loading ships:', error);
        toast({
          title: 'Error',
          description: 'Failed to load ship data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShips();
  }, [toast]);
  
  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to access ship selection.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, loading, navigate, toast]);
  
  // Filter ships
  useEffect(() => {
    if (shipFilter === 'all') {
      setFilteredShips(ships);
    } else {
      setFilteredShips(ships.filter(ship => {
        const specs = ship.specifications as any;
        return specs.aegisBaseline === shipFilter;
      }));
    }
  }, [ships, shipFilter]);
  
  const handleShipSelect = (ship: Ship) => {
    setSelectedShip(ship);
  };
  
  const handleSelectShip = () => {
    if (selectedShip) {
      toast({
        title: 'Ship Selected',
        description: `${selectedShip.name} has been assigned to your command.`,
      });
      // This would normally update user's selected ship in the database
      navigate('/command-center');
    }
  };
  
  const handleToggleSystem = async (type: 'systems' | 'sensors', index: number) => {
    if (!selectedShip) return;
    
    try {
      const updatedShip = await toggleShipSystem(selectedShip.id, type, index);
      if (updatedShip) {
        // Update ships state
        setShips(ships.map(ship => 
          ship.id === updatedShip.id ? updatedShip : ship
        ));
        
        // Update selected ship
        setSelectedShip(updatedShip);
        
        const systemName = (updatedShip.specifications as any)[type][index].name;
        const isActive = (updatedShip.specifications as any)[type][index].isActive;
        
        toast({
          title: isActive ? 'System Activated' : 'System Deactivated',
          description: `${systemName} is now ${isActive ? 'online' : 'offline'}.`,
        });
      }
    } catch (error) {
      console.error('Error toggling system:', error);
      toast({
        title: 'System Error',
        description: 'Failed to toggle system status.',
        variant: 'destructive',
      });
    }
  };
  
  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 font-mono text-sm text-muted-foreground">LOADING VESSEL DATABASE...</p>
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
              <ShipIcon className="h-4 w-4 mr-2 text-primary" />
              <h1 className="text-lg font-mono tracking-tight">VESSEL SELECTION</h1>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/command-center')}
              className="font-mono text-xs flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              COMMAND CENTER
            </Button>
            <AuthButton />
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto p-4 flex gap-6">
        {/* Ship listing */}
        <div className="w-1/3 glass-panel rounded-lg p-4 border border-border">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-mono tracking-tight flex items-center">
              <ShipIcon className="h-4 w-4 mr-2 text-primary" />
              VESSELS
            </h2>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Tabs defaultValue="all" value={shipFilter} onValueChange={setShipFilter}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">ALL</TabsTrigger>
                  <TabsTrigger value="5.4" className="text-xs">BL 5.4</TabsTrigger>
                  <TabsTrigger value="7.0" className="text-xs">BL 7.0</TabsTrigger>
                  <TabsTrigger value="9.x" className="text-xs">BL 9.x</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            {filteredShips.length === 0 ? (
              <p className="text-center text-muted-foreground font-mono text-sm">
                No vessels available
              </p>
            ) : (
              filteredShips.map((ship) => (
                <ShipCard
                  key={ship.id}
                  ship={ship}
                  onClick={() => handleShipSelect(ship)}
                  selected={selectedShip?.id === ship.id}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Ship details */}
        <div className="w-2/3 glass-panel rounded-lg p-4 border border-border h-[calc(100vh-8rem)] flex flex-col">
          {selectedShip ? (
            <ShipDetails 
              ship={selectedShip} 
              onSelectShip={handleSelectShip}
              onToggleSystem={handleToggleSystem}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-muted-foreground font-mono">
                Select a vessel to view details
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShipSelection;
