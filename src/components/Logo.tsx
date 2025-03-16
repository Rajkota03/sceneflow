
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'default' }) => {
  const sizeClass = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  const variantClass = {
    default: 'text-slate-900',
    light: 'text-white',
  }[variant];

  // Animation for the dots
  const dotVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.1,
        duration: 0.5,
        ease: "easeOut" 
      }
    }),
  };

  return (
    <div className="flex items-center">
      <div className={`relative font-serif font-bold ${sizeClass} flex items-baseline`}>
        <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mr-0.5">
          Scene
        </span>
        <motion.div className="w-5 h-5 mx-0.5 relative">
          <motion.span 
            className="absolute bottom-1.5 left-0.5 w-1.5 h-1.5 bg-primary rounded-full"
            variants={dotVariants}
            initial="initial"
            animate="animate"
            custom={0}
          />
          <motion.span 
            className="absolute bottom-1.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full"
            variants={dotVariants}
            initial="initial"
            animate="animate"
            custom={1}
          />
        </motion.div>
        <span className={variantClass}>Flow</span>
      </div>
    </div>
  );
};

export default Logo;
