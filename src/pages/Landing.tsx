
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertCircle, Radio, Lock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import TerminalText from "@/components/TerminalText";
import RadarAnimation from "@/components/RadarAnimation";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulate system initialization
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleEnterCommandCenter = () => {
    navigate("/command-center");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3,
        duration: 0.5 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0e17] text-foreground overflow-hidden flex flex-col">
      {/* Background tactical grid */}
      <div className="absolute inset-0 bg-[url('/assets/tactical-grid.svg')] bg-center opacity-10 z-0"></div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/80 z-0"></div>
      
      {/* Command center content */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center flex-grow px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top status bar */}
        <motion.div 
          className="fixed top-0 left-0 right-0 glass-panel h-12 flex items-center justify-between px-4 text-xs text-primary/70 border-b border-primary/20 z-20"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>SYSTEM ONLINE</span>
            <span className="text-muted-foreground pl-2 border-l border-primary/20">SECURITY LEVEL ALPHA</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Radio size={12} />
              <span>COMM: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle size={12} />
              <span>THREAT: LOW</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock size={12} />
              <span>ENCRYPTION: ENABLED</span>
            </div>
          </div>
        </motion.div>

        {/* Main content area */}
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 py-12 md:py-16">
          {/* Left column - Branding and text */}
          <div className="flex flex-col justify-center">
            <motion.div variants={itemVariants} className="mb-2 flex items-center">
              <Shield className="text-primary mr-2" />
              <span className="text-sm uppercase tracking-widest font-mono text-primary/70">Classified Operations</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-6xl font-bold mb-4 flex items-center gap-3"
            >
              <img src="/assets/hellhound-icon.svg" alt="Hellhound" className="h-12 md:h-16 w-auto pulse-glow" />
              <img src="/assets/text-logo.svg" alt="Dicehaven" className="h-10 md:h-14 w-auto" />
            </motion.h1>
            
            <motion.p 
              variants={itemVariants} 
              className="text-lg md:text-xl mb-6 text-foreground/80"
            >
              Advanced Tactical Gaming Environment
            </motion.p>
            
            <motion.div 
              variants={itemVariants} 
              className="glass-panel p-4 md:p-6 mb-8 border border-primary/20 rounded-lg"
            >
              <TerminalText delay={1800} className="text-sm md:text-base font-mono text-primary/90" />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button 
                onClick={handleEnterCommandCenter} 
                className="group relative px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-md font-medium text-lg border border-primary/40 hover:border-primary/60 shadow-glow transition-all"
              >
                <span className="flex items-center">
                  ENTER COMMAND CENTER 
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </div>
          
          {/* Right column - Visuals */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              <RadarAnimation />
              
              {/* Decorative elements */}
              <div className="absolute top-0 left-1/4 glass-panel h-8 px-3 flex items-center text-xs font-mono text-primary/70 border border-primary/30 rounded">
                NAV_SYS:ONLINE
              </div>
              
              <div className="absolute bottom-1/4 right-0 glass-panel h-8 px-3 flex items-center text-xs font-mono text-primary/70 border border-primary/30 rounded">
                COMMS:SECURE
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Bottom status bar */}
      <motion.div 
        className="relative z-10 glass-panel h-8 border-t border-primary/20 flex items-center justify-between px-4 text-xs text-primary/70"
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div>HELLHOUND TACTICAL SYSTEM v1.0.3</div>
        <div className="flex items-center gap-4">
          <div>LAT: 36.12.45 N</div>
          <div>LONG: 122.18.22 W</div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            <span>CONNECTION SECURE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
