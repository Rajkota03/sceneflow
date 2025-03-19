
import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Structure } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BeatPopoverContentProps {
  selectedStructure: Structure;
  elementBeatId?: string;
  onBeatSelect: (beatId: string, actId: string) => void;
}

const BeatPopoverContent: React.FC<BeatPopoverContentProps> = ({
  selectedStructure,
  elementBeatId,
  onBeatSelect
}) => {
  // Check if selectedStructure exists and has acts
  const getActs = () => {
    if (!selectedStructure) return [];
    
    // Handle case where acts might be nested or an array
    if (Array.isArray(selectedStructure.acts)) {
      return selectedStructure.acts;
    } 
    
    if (selectedStructure.acts && typeof selectedStructure.acts === 'object') {
      const actsObj = selectedStructure.acts as any;
      if (Array.isArray(actsObj)) {
        return actsObj;
      }
    }
    
    return [];
  };
  
  const acts = getActs();

  // If no valid acts are found, display a message
  if (!acts || acts.length === 0) {
    return (
      <div className="p-3 text-sm text-center text-gray-500">
        No beats available. Please select a different structure.
      </div>
    );
  }

  return (
    <div className="w-full max-h-80 overflow-auto p-0">
      {acts.map(act => {
        // Get a color for the act heading
        const getActColor = () => {
          if (act.title.toLowerCase().includes('act 1')) return 'bg-blue-50 text-blue-700 border-blue-200';
          if (act.title.toLowerCase().includes('act 2a')) return 'bg-amber-50 text-amber-700 border-amber-200';
          if (act.title.toLowerCase().includes('midpoint')) return 'bg-pink-50 text-pink-700 border-pink-200';
          if (act.title.toLowerCase().includes('act 2b')) return 'bg-orange-50 text-orange-700 border-orange-200';
          if (act.title.toLowerCase().includes('act 3')) return 'bg-green-50 text-green-700 border-green-200';
          return 'bg-gray-50 text-gray-700 border-gray-200';
        };
        
        return (
          <React.Fragment key={act.id}>
            <div className={cn(
              "px-2 py-1 text-xs font-medium border-y",
              getActColor()
            )}>
              {act.title || "Act"}
            </div>
            <ScrollArea className="h-full max-h-48 w-full">
              <div className="p-2 flex flex-wrap gap-1.5">
                {act.beats && Array.isArray(act.beats) ? (
                  act.beats.map(beat => {
                    const isSelected = elementBeatId === beat.id;
                    
                    return (
                      <Badge 
                        key={beat.id}
                        onClick={() => onBeatSelect(beat.id, act.id)}
                        className={cn(
                          "cursor-pointer flex items-center gap-1 px-2 py-1 text-xs whitespace-nowrap",
                          isSelected 
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300" 
                            : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                        )}
                      >
                        {isSelected && <Flame size={10} className="h-3 w-3" />}
                        <span className="truncate max-w-[120px]">{beat.title}</span>
                      </Badge>
                    );
                  })
                ) : (
                  <div className="px-2 py-1 text-xs text-gray-500">
                    No beats defined for this act
                  </div>
                )}
              </div>
            </ScrollArea>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BeatPopoverContent;
