
import React from 'react';
import { Structure, Act } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StructureProgressBarProps {
  structure: Structure;
  currentPage?: number;
  totalPages?: number;
  className?: string;
  // Add progress property to fix the typing error
  progress?: number;
}

const StructureProgressBar: React.FC<StructureProgressBarProps> = ({
  structure,
  currentPage = 1,
  totalPages = 120,
  className,
  progress
}) => {
  // Calculate current progress as a percentage
  const currentProgress = progress !== undefined 
    ? progress 
    : (currentPage / totalPages) * 100;
  
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        {/* Background segments for acts */}
        {structure.acts.map((act) => (
          <div 
            key={act.id}
            className="absolute h-full opacity-30"
            style={{
              left: `${act.startPosition}%`,
              width: `${act.endPosition - act.startPosition}%`,
              backgroundColor: act.colorHex,
            }}
          />
        ))}
        
        {/* Beat markers */}
        {structure.acts.flatMap(act => 
          act.beats.map(beat => (
            <TooltipProvider key={beat.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute w-1 h-full bg-gray-800 opacity-70 cursor-pointer"
                    style={{ left: `${beat.timePosition}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-bold">{beat.title}</p>
                    <p className="text-gray-500">Page {beat.pageRange || Math.round((beat.timePosition / 100) * totalPages)}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        )}
        
        {/* Progress indicator */}
        <div 
          className="absolute h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${currentProgress}%` }}
        />
        
        {/* Current page marker */}
        <div
          className="absolute w-2 h-6 bg-red-500 top-[-4px] rounded-full shadow-md z-10 transition-all duration-300"
          style={{ left: `calc(${currentProgress}% - 4px)` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Page {currentPage}</span>
        <span>{totalPages} pages (total)</span>
      </div>
    </div>
  );
};

export default StructureProgressBar;
