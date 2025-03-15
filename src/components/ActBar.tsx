
import React, { useState } from 'react';
import { ActType } from '@/lib/types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Filter, Zap, ZapOff, Check } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

// Define the BeatMode type to ensure consistent usage
type BeatMode = 'on' | 'off';

interface ActBarProps {
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  actCounts: Record<ActType | string, number>;
  projectName?: string;
  structureName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct,
  actCounts,
  projectName = "Untitled Project",
  structureName = "Three Act Structure",
  beatMode = 'on',
  onToggleBeatMode
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const acts: { id: ActType; label: string; color: string }[] = [
    { id: 1, label: 'Act 1', color: 'bg-[#D3E4FD] hover:bg-[#B8D2F8] border-[#4A90E2]' },
    { id: '2A', label: 'Act 2A', color: 'bg-[#FEF7CD] hover:bg-[#FDF0B0] border-[#F5A623]' },
    { id: 'midpoint', label: 'Midpoint', color: 'bg-[#FFCCCB] hover:bg-[#FFB9B8] border-[#FF9E9D]' },
    { id: '2B', label: 'Act 2B', color: 'bg-[#FDE1D3] hover:bg-[#FCCEB8] border-[#F57C00]' },
    { id: 3, label: 'Act 3', color: 'bg-[#F2FCE2] hover:bg-[#E5F8C8] border-[#009688]' },
  ];

  const handleBeatModeToggle = (value: BeatMode) => {
    if (onToggleBeatMode) {
      onToggleBeatMode(value);
    }
  };

  // Don't render in free mode
  if (beatMode === 'off') {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-slate-50 rounded-md shadow-sm mb-3 w-full">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2">
                <h3 className="text-sm font-medium text-slate-700 mr-1">Story Structure</h3>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </CollapsibleTrigger>
            <span className="ml-2 text-sm font-medium text-slate-600">{projectName}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">{structureName}</span>
            
            {onToggleBeatMode && (
              <div className="flex items-center gap-2">
                <Button
                  variant={beatMode === 'on' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBeatModeToggle('on')}
                  className={cn(
                    "h-7 flex items-center gap-1 relative text-xs",
                    beatMode === 'on' && "after:absolute after:inset-0 after:animate-pulse after:bg-primary/20 after:rounded-md after:z-[-1]"
                  )}
                >
                  <Zap size={14} />
                  <span>Beat Mode</span>
                  {beatMode === 'on' && <Check size={14} className="ml-1" />}
                </Button>
                
                <Button
                  variant={beatMode === 'off' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBeatModeToggle('off')}
                  className="h-7 flex items-center gap-1 text-xs"
                >
                  <ZapOff size={14} />
                  <span>Free Mode</span>
                  {beatMode === 'off' && <Check size={14} className="ml-1" />}
                </Button>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectAct(null)}
              disabled={activeAct === null}
              className="h-7 text-xs text-slate-600"
            >
              <Filter size={14} className="mr-1" />
              Show All
            </Button>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="grid grid-cols-5 gap-1 mt-2">
            {acts.map((act) => (
              <button
                key={act.id}
                onClick={() => onSelectAct(activeAct === act.id ? null : act.id)}
                className={cn(
                  act.color,
                  'h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all shadow-sm',
                  activeAct === act.id ? 'border-2' : 'border opacity-95',
                  activeAct !== null && activeAct !== act.id ? 'opacity-70' : 'opacity-100'
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ActBar;
