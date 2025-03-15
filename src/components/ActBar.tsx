
import React from 'react';
import { ActType } from '@/lib/types';
import { Filter } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ActBarProps {
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  actCounts: Record<ActType | string, number>;
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct,
  actCounts
}) => {
  const acts: { id: ActType; label: string; color: string }[] = [
    { id: 1, label: 'Act 1', color: 'bg-[#D3E4FD] hover:bg-[#B8D2F8] border-[#4A90E2]' },
    { id: '2A', label: 'Act 2A', color: 'bg-[#FEF7CD] hover:bg-[#FDF0B0] border-[#F5A623]' },
    { id: 'midpoint', label: 'Midpoint', color: 'bg-[#FFCCCB] hover:bg-[#FFB9B8] border-[#FF9E9D]' },
    { id: '2B', label: 'Act 2B', color: 'bg-[#FDE1D3] hover:bg-[#FCCEB8] border-[#F57C00]' },
    { id: 3, label: 'Act 3', color: 'bg-[#F2FCE2] hover:bg-[#E5F8C8] border-[#009688]' },
  ];

  return (
    <div className="mb-4 p-2 bg-white rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Act Bar</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectAct(null)}
          disabled={activeAct === null}
          className="h-7 text-xs"
        >
          <Filter size={14} className="mr-1" />
          Show All
        </Button>
      </div>
      
      <div className="grid grid-cols-5 gap-1">
        {acts.map((act) => (
          <button
            key={act.id}
            onClick={() => onSelectAct(activeAct === act.id ? null : act.id)}
            className={cn(
              act.color,
              'h-8 rounded flex items-center justify-center text-xs font-medium transition-all',
              activeAct === act.id ? 'border-2' : 'border opacity-90',
              activeAct !== null && activeAct !== act.id ? 'opacity-60' : 'opacity-100'
            )}
          >
            {act.label}
            {actCounts[act.id] > 0 && (
              <span className="ml-1 bg-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {actCounts[act.id]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActBar;
