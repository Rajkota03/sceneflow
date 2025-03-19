
import React, { useEffect } from 'react';
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
  // Handle different structure of the acts prop
  // Check if selectedStructure exists and has acts
  const getActs = () => {
    if (!selectedStructure) return [];
    
    // Handle case where acts might be nested or an array
    if (Array.isArray(selectedStructure.acts)) {
      return selectedStructure.acts;
    } 
    
    // Handle case where acts might be in a nested object
    // First check if acts exists and is an object
    if (selectedStructure.acts && typeof selectedStructure.acts === 'object') {
      // Then check if it has an 'acts' property using type assertion
      const actsObj = selectedStructure.acts as { acts?: any };
      if (actsObj.acts && Array.isArray(actsObj.acts)) {
        return actsObj.acts;
      }
    }
    
    return [];
  };
  
  const acts = getActs();

  useEffect(() => {
    console.log('BeatPopoverContent render:', { 
      structureId: selectedStructure?.id,
      elementBeatId,
      actsCount: acts.length,
      acts: acts
    });
  }, [selectedStructure, elementBeatId, acts]);

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
      <div className="py-1 text-sm font-medium px-2 bg-muted">
        Select Beat
      </div>
      
      {acts.map(act => (
        <React.Fragment key={act.id}>
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
            {act.title || "Act"}
          </div>
          <div className="p-1">
            {act.beats && Array.isArray(act.beats) ? (
              act.beats.map(beat => {
                const isSelected = elementBeatId === beat.id;
                
                return (
                  <button 
                    key={beat.id}
                    onClick={() => {
                      console.log('Beat clicked:', beat.id, act.id);
                      onBeatSelect(beat.id, act.id);
                    }}
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
                          ({beat.sceneCount} Scene{beat.sceneCount !== 1 ? 's' : ''})
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
      ))}
    </div>
  );
};

export default BeatPopoverContent;
