
import React from 'react';
import { Structure } from '@/lib/types';
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
  // Safely handle the case where acts might not be an array
  if (!selectedStructure.acts || !Array.isArray(selectedStructure.acts) || selectedStructure.acts.length === 0) {
    return (
      <div className="p-3 text-sm text-center text-yellow-600">
        This structure doesn't have any acts or beats defined.
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[350px] overflow-auto">
      <div className="p-2">
        {selectedStructure.acts.map((act) => (
          <div key={act.id} className="mb-3">
            <h3 className="font-medium text-xs text-gray-500 uppercase tracking-wider mb-1 px-1">
              {act.title || `Act ${act.number || ''}`}
            </h3>
            <div className="space-y-1">
              {Array.isArray(act.beats) && act.beats.map((beat) => (
                <div
                  key={beat.id}
                  className={`px-2 py-1.5 rounded text-sm cursor-pointer ${
                    elementBeatId === beat.id
                      ? 'bg-orange-100 text-orange-800'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onBeatSelect(beat.id, act.id)}
                >
                  <div className="flex items-center">
                    <span>{beat.title}</span>
                    {beat.complete && (
                      <span className="ml-auto text-xs text-green-600">✓</span>
                    )}
                  </div>
                  {beat.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {beat.description}
                    </p>
                  )}
                </div>
              ))}
              {(!act.beats || act.beats.length === 0) && (
                <div className="px-2 py-1.5 text-sm text-gray-400 italic">
                  No beats in this act
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default BeatPopoverContent;
