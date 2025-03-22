
import React from 'react';
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
  return (
    <div className="w-full">
      <div className="p-2 bg-slate-100 dark:bg-slate-700 border-b">
        <h4 className="font-medium text-sm">{selectedStructure.name}</h4>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {selectedStructure.acts?.map((act) => (
          <div key={act.id} className="border-b last:border-0">
            <div className="p-2 bg-slate-50 dark:bg-slate-800">
              <h5 className="font-medium text-xs">{act.title}</h5>
            </div>
            <div>
              {act.beats?.map((beat) => (
                <button
                  key={beat.id}
                  className={`flex items-center justify-between w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    elementBeatId === beat.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                  onClick={() => onBeatSelect(beat.id, act.id)}
                >
                  <span className="text-xs">{beat.title}</span>
                  {elementBeatId === beat.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeatPopoverContent;
