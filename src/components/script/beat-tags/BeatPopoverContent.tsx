
import React from 'react';
import { Structure, Act } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface BeatPopoverContentProps {
  selectedStructure: Structure;
  elementBeatId?: string | null;
  onBeatSelect: (beatId: string, actId: string) => void;
}

const BeatPopoverContent: React.FC<BeatPopoverContentProps> = ({
  selectedStructure,
  elementBeatId,
  onBeatSelect
}) => {
  if (!selectedStructure?.acts || selectedStructure.acts.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No beats available in this structure.
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-auto">
      {selectedStructure.acts.map((act) => (
        <div key={act.id} className="border-b border-gray-200 last:border-0">
          <div className="px-3 py-2 font-medium bg-gray-50 dark:bg-gray-800">
            {act.title}
          </div>
          <div className="p-1">
            {act.beats && act.beats.map((beat) => (
              <div
                key={beat.id}
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm flex items-center justify-between",
                  elementBeatId === beat.id
                    ? "bg-blue-50 dark:bg-blue-900/20 font-medium"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                )}
                onClick={() => onBeatSelect(beat.id, act.id)}
              >
                <span>{beat.title}</span>
                {elementBeatId === beat.id && (
                  <Check size={16} className="text-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BeatPopoverContent;
