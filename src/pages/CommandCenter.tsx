
import React, { useEffect } from "react";
import { GameProvider } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import Map from "@/components/Map";
import Sidebar from "@/components/Sidebar";
import AuthButton from "@/components/auth/AuthButton";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CommandCenter: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to access the command center.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, loading, navigate, toast]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 font-mono text-sm text-muted-foreground">AUTHENTICATING ACCESS...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the content (will be redirected by useEffect)
  if (!user) return null;

  return (
    <GameProvider>
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
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm hover:text-primary transition-colors">Maps</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Characters</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Settings</a>
              <AuthButton />
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Map area */}
          <div className="flex-grow h-[calc(100vh-8rem)] overflow-hidden rounded-lg shadow-xl animate-fade-in">
            <Map />
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 h-[calc(100vh-8rem)] animate-slide-in">
            <Sidebar />
          </div>
        </main>
      </div>
    </GameProvider>
  );
};

export default CommandCenter;
