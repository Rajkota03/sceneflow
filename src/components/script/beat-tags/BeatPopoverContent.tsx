
import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Structure } from '@/lib/types';

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
            <div className="p-1">
              {act.beats && Array.isArray(act.beats) ? (
                act.beats.map(beat => {
                  const isSelected = elementBeatId === beat.id;
                  
                  return (
                    <button 
                      key={beat.id}
                      onClick={() => onBeatSelect(beat.id, act.id)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-xs rounded",
                        isSelected 
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{beat.title}</span>
                        {beat.sceneCount && beat.sceneCount > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({beat.sceneCount})
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center mt-0.5 text-xs text-orange-600 dark:text-orange-400">
                          <Flame size={10} className="mr-1" />
                          <span>Tagged</span>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-2 py-1 text-xs text-gray-500">
                  No beats defined for this act
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BeatPopoverContent;
