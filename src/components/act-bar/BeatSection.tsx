
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface BeatSectionProps {
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

const BeatSection: React.FC<BeatSectionProps> = ({
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
    <div className="w-full flex flex-wrap gap-1">
      {beats.map((beat) => (
        <Button
          key={beat.id}
          variant="outline"
          size="sm"
          onClick={() => onBeatClick && onBeatClick(beat.id)}
          className={cn(
            "h-auto py-0.5 px-1.5 text-xs rounded flex items-start gap-1.5",
            activeBeatId === beat.id 
              ? "border-orange-400 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-700"
              : "border-gray-200 hover:bg-gray-50",
            beat.complete && "border-green-400 bg-green-50 hover:bg-green-100"
          )}
        >
          <div className="flex flex-col">
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
            
            {beat.pageRange && (
              <span className="text-[9px] text-gray-500">
                {beat.pageRange}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default BeatSection;
