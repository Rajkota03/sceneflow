
import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface HorizontalBeatsBarProps {
  actId: string;
  actColor: string;
  actBgColor: string;
  beats: Array<{
    id: string;
    title: string;
    description?: string;
    complete?: boolean;
    sceneCount?: number;
    pageRange?: string;
    actId?: string;
    actColor?: string;
    actBgColor?: string;
  }>;
  onBeatClick?: (beatId: string) => void;
  activeBeatId?: string | null;
}

const HorizontalBeatsBar: React.FC<HorizontalBeatsBarProps> = ({
  actId,
  actColor,
  actBgColor,
  beats,
  onBeatClick,
  activeBeatId
}) => {
  // Skip rendering if no beats
  if (!beats || beats.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-1">
      <TooltipProvider>
        <div className="flex flex-wrap gap-1">
          {beats.map((beat) => {
            // Use beat's act color if available (for combined view)
            const beatBgColor = beat.actBgColor || actBgColor;
            const beatTextColor = beat.actColor || actColor;
            
            return (
              <Tooltip key={beat.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBeatClick && onBeatClick(beat.id)}
                    className={cn(
                      "h-6 py-0.5 px-1.5 text-xs rounded whitespace-nowrap",
                      activeBeatId === beat.id 
                        ? "border-orange-400 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-700"
                        : "border-gray-200 hover:bg-gray-50",
                      beat.complete && "border-green-400 bg-green-50 hover:bg-green-100"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "font-medium truncate max-w-[100px]",
                        activeBeatId === beat.id ? "text-orange-700 dark:text-orange-400" : "",
                        beat.complete ? "text-green-700" : ""
                      )}>
                        {beat.title}
                      </span>
                      
                      {(beat.sceneCount && beat.sceneCount > 0) ? (
                        <span className={cn(
                          "rounded-full px-1 py-0.5 text-[9px] font-medium",
                          activeBeatId === beat.id 
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        )}>
                          {beat.sceneCount}
                        </span>
                      ) : null}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{beat.title}</p>
                  {beat.description && <p className="text-xs text-gray-500 mt-1">{beat.description}</p>}
                  {beat.actId && (
                    <p className="text-xs font-medium mt-1">
                      <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded", 
                        beat.actBgColor || "bg-gray-100"
                      )}>
                        {actButtons.find(a => a.id === beat.actId)?.label || beat.actId}
                      </span>
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
};

// Helper variable for displaying act titles in tooltips
const actButtons = [
  { id: 'act1', label: 'Act 1' },
  { id: 'act2a', label: 'Act 2A' },
  { id: 'midpoint', label: 'Midpoint' },
  { id: 'act2b', label: 'Act 2B' },
  { id: 'act3', label: 'Act 3' }
];

export default HorizontalBeatsBar;
