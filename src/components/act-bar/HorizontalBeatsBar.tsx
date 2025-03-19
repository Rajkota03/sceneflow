
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

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
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Skip rendering if no beats
  if (!beats || beats.length === 0) {
    return null;
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollAmount = 200; // Adjust as needed
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
      setScrollPosition(container.scrollLeft);
    } else {
      container.scrollLeft += scrollAmount;
      setScrollPosition(container.scrollLeft);
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = containerRef.current 
    ? containerRef.current.scrollWidth > containerRef.current.clientWidth + scrollPosition
    : false;

  return (
    <div className="w-full flex items-center">
      {/* Left scroll button */}
      {beats.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          className="px-1 h-6 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
        >
          <ChevronLeft size={14} />
        </Button>
      )}
      
      {/* Scrollable beats container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto scrollbar-hide flex gap-1 py-1 px-1"
        style={{ scrollBehavior: 'smooth' }}
      >
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
                      "font-medium",
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
      
      {/* Right scroll button */}
      {beats.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          className="px-1 h-6 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
        >
          <ChevronRight size={14} />
        </Button>
      )}
    </div>
  );
};

export default HorizontalBeatsBar;
