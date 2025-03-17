
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
    <div className="flex items-center space-x-1">
      {/* Fixed text alignment */}
      <span className={`font-serif font-bold ${sizeClass} bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent`}>
        Scene
      </span>

      {/* Dot Container Moved Outside for Proper Alignment */}
      <div className="flex space-x-1">
        <motion.span 
          className="w-1.5 h-1.5 bg-primary rounded-full"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          custom={0}
        />
        <motion.span 
          className="w-1.5 h-1.5 bg-primary rounded-full"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          custom={1}
        />
      </div>

      {/* "Flow" text positioned correctly */}
      <span className={`${variantClass} font-serif font-bold ${sizeClass}`}>
        Flow
      </span>
    </div>
  );
};

export default Logo;
