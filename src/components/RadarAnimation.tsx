
import React from 'react';
import { motion } from 'framer-motion';

const RadarAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Background circle */}
      <div className="absolute inset-0 rounded-full border border-primary/20 bg-black/30 backdrop-blur-sm"></div>
      
      {/* Grid lines */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 border-2 border-primary/10 rounded-full"></div>
        <div className="absolute top-1/4 bottom-1/4 left-1/4 right-1/4 border border-primary/10 rounded-full"></div>
        <div className="absolute top-[37.5%] bottom-[37.5%] left-[37.5%] right-[37.5%] border border-primary/10 rounded-full"></div>
        
        {/* X-Y axis lines */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/10"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/10"></div>
      </div>
      
      {/* Radar sweep */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-1/2 h-1 bg-gradient-to-r from-primary/70 to-transparent origin-left"
        style={{ rotateZ: 0 }}
        animate={{ rotateZ: 360 }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      ></motion.div>
      
      {/* Center point */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1 -translate-y-1"></div>
      
      {/* Target blips */}
      <motion.div
        className="absolute top-[30%] left-[65%] w-2 h-2 bg-destructive rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      <motion.div
        className="absolute top-[65%] left-[40%] w-2 h-2 bg-green-500 rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      ></motion.div>
      
      <motion.div
        className="absolute top-[45%] left-[25%] w-1.5 h-1.5 bg-yellow-500 rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      ></motion.div>
    </div>
  );
};

export default RadarAnimation;
