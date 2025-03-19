
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
    <ScrollArea className="w-full">
      <div className="flex flex-wrap gap-1 py-1 px-1">
        <TooltipProvider>
          {beats.map((beat) => (
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
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </ScrollArea>
  );
};

export default HorizontalBeatsBar;
