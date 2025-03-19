
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import HorizontalBeatsBar from './HorizontalBeatsBar';

interface BeatsRowProps {
  actId: string;
  actLabel: string;
  actColor: string;
  actBgColor: string;
  beats: Array<{id: string; title: string; description?: string; complete?: boolean; sceneCount?: number; pageRange?: string;}>;
  onBeatClick?: (beatId: string) => void;
  activeBeatId?: string | null;
}

const BeatsRow: React.FC<BeatsRowProps> = ({
  actId,
  actLabel,
  actColor,
  actBgColor,
  beats,
  onBeatClick,
  activeBeatId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Skip rendering if no beats
  if (!beats || beats.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "border rounded-md overflow-hidden mb-1",
      actBgColor.replace('bg-', 'border-').replace('100', '200').replace('200', '300')
    )}>
      <div className="flex justify-between items-center">
        <div 
          className={cn(
            "px-2 py-1 text-xs font-medium cursor-pointer flex-grow", 
            actBgColor, 
            actColor
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 mr-1" />
            ) : (
              <ChevronDown className="h-3 w-3 mr-1" />
            )}
            {actLabel} Beats
            <span className="text-xs font-normal ml-2 opacity-70">
              ({beats.length})
            </span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 px-2 m-1"
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="px-2 py-1.5">
          <HorizontalBeatsBar
            actId={actId}
            actColor={actColor}
            actBgColor={actBgColor}
            beats={beats}
            onBeatClick={onBeatClick}
            activeBeatId={activeBeatId}
          />
        </div>
      )}
    </div>
  );
};

export default BeatsRow;
