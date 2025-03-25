
import React from 'react';
import { Act } from '@/lib/types';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

export interface StructureProgressBarProps {
  structure?: {
    id: string;
    name: string;
    acts: Act[];
  };
  acts?: Act[];
  progress?: number;
}

const StructureProgressBar: React.FC<StructureProgressBarProps> = ({ 
  structure, 
  acts = structure?.acts || [],
  progress = 0 
}) => {
  // Helper function to determine status text and styles
  const getStatusInfo = (progress: number) => {
    if (progress < 30) {
      return {
        text: "Just Started",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      };
    } else if (progress < 70) {
      return {
        text: "In Progress",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      };
    } else if (progress < 100) {
      return {
        text: "Almost Done",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      };
    } else {
      return {
        text: "Complete",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      };
    }
  };

  const statusInfo = getStatusInfo(progress);

  return (
    <div className="w-full space-y-1">
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
        {acts.map((act, index) => (
          <div
            key={index}
            className="absolute h-full"
            style={{
              left: `${act.startPosition}%`,
              width: `${act.endPosition - act.startPosition}%`,
              backgroundColor: act.colorHex,
            }}
          />
        ))}
        
        <div 
          className="absolute h-full bg-green-500 opacity-30 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium">{Math.round(progress)}% Complete</span>
        {progress > 0 && (
          <span className={cn(
            "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
            statusInfo.className
          )}>
            {statusInfo.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default StructureProgressBar;
