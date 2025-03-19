
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
  // Ensure acts is an array before rendering
  const acts = Array.isArray(selectedStructure?.acts) 
    ? selectedStructure.acts 
    : (selectedStructure?.acts?.acts || []);

  console.log('BeatPopoverContent render:', { 
    structureId: selectedStructure?.id,
    elementBeatId,
    actsCount: acts.length
  });

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
            {act.beats?.map(beat => {
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
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default BeatPopoverContent;
