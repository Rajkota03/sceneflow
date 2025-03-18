
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface Beat {
  id: string;
  title: string;
  description?: string;
  complete?: boolean;
}

interface BeatSectionProps {
  actId: string;
  actColor: string;
  actBgColor: string;
  beats: Beat[];
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render anything if there are no beats
  if (!beats || beats.length === 0) return null;

  return (
    <div className="ml-4 mt-1 mb-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 p-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 mr-1" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 mr-1" />
        )}
        <span>Beats</span>
        <Badge variant="outline" className="ml-1 text-xs h-4 px-1.5 bg-white dark:bg-gray-800">
          {beats.length}
        </Badge>
      </Button>
      
      {isExpanded && (
        <div className="pl-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700">
          {beats.map((beat) => (
            <Button
              key={beat.id}
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 py-0.5 px-2 text-xs justify-start",
                activeBeatId === beat.id ? `${actBgColor}/80 ${actColor} hover:${actBgColor}/80` : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => onBeatClick?.(beat.id)}
            >
              <span className="truncate">
                {beat.title}
              </span>
              {beat.complete && (
                <div className="ml-1.5 w-2 h-2 rounded-full bg-green-500" />
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BeatSection;
