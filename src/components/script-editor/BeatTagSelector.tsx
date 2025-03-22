
import React from 'react';
import { Act, Beat } from '@/lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Flame, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeatTagSelectorProps {
  elementId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  structure: {
    acts: Act[];
  } | null;
  activeBeatId: string | undefined;
  onBeatSelect: (elementId: string, beatId: string, actId: string) => void;
  onRemoveBeat: (elementId: string) => void;
}

const BeatTagSelector: React.FC<BeatTagSelectorProps> = ({
  elementId,
  isOpen,
  onOpenChange,
  structure,
  activeBeatId,
  onBeatSelect,
  onRemoveBeat,
}) => {
  // If no structure is selected, don't render the component
  if (!structure) return null;
  
  // Get all available beats from the structure
  const beatsByAct = structure.acts.map(act => ({
    actId: act.id,
    actTitle: act.title,
    actColorHex: act.colorHex,
    beats: act.beats || []
  }));
  
  // Get color for the currently selected beat
  const getActiveBeatColor = () => {
    if (!activeBeatId) return undefined;
    
    for (const act of beatsByAct) {
      const beat = act.beats.find(b => b.id === activeBeatId);
      if (beat) {
        return act.actColorHex || getDefaultActColor(act.actId);
      }
    }
    return undefined;
  };
  
  // Default colors when not specified
  const getDefaultActColor = (actId: string) => {
    const actColors: Record<string, string> = {
      'act1': '#B0C4DE', // Light Steel Blue
      'act2a': '#F5DEB3', // Wheat
      'midpoint': '#D8BFD8', // Thistle
      'act2b': '#DEB887', // Burly Wood
      'act3': '#A2BBA3', // Sage Green
    };
    
    return actColors[actId] || '#888888';
  };
  
  // Get active beat title
  const getActiveBeatTitle = () => {
    if (!activeBeatId) return '';
    
    for (const act of beatsByAct) {
      const beat = act.beats.find(b => b.id === activeBeatId);
      if (beat) {
        return beat.title;
      }
    }
    return '';
  };
  
  const activeBeatTitle = getActiveBeatTitle();
  const activeBeatColor = getActiveBeatColor();
  
  const handleBeatClick = (beat: Beat, actId: string) => {
    onBeatSelect(elementId, beat.id, actId);
    onOpenChange(false);
  };
  
  const handleRemoveBeat = () => {
    onRemoveBeat(elementId);
    onOpenChange(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={activeBeatId ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-6 px-2 text-xs rounded-full",
            activeBeatId ? "text-gray-800" : "text-gray-500 border-dashed border-gray-300"
          )}
          style={activeBeatId ? { 
            backgroundColor: activeBeatColor,
            borderColor: activeBeatColor,
            opacity: 0.9
          } : {}}
        >
          <Flame size={14} className={activeBeatId ? "mr-1" : ""} />
          {activeBeatTitle}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search beats..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No beats found.</CommandEmpty>
            
            {beatsByAct.map(({ actId, actTitle, actColorHex, beats }) => (
              <CommandGroup key={actId} heading={actTitle} className="text-xs">
                {beats.map(beat => {
                  const isActive = activeBeatId === beat.id;
                  const bgColor = actColorHex || getDefaultActColor(actId);
                  
                  return (
                    <CommandItem
                      key={beat.id}
                      onSelect={() => handleBeatClick(beat, actId)}
                      className={cn(
                        "text-xs flex items-center gap-2 cursor-pointer",
                        isActive ? "bg-opacity-20" : ""
                      )}
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: bgColor }}
                      />
                      <span className="flex-grow">{beat.title}</span>
                      {isActive && <Flame size={14} className="text-amber-500" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
            
            {activeBeatId && (
              <div className="border-t border-gray-100 p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleRemoveBeat}
                >
                  <X size={14} className="mr-2" />
                  Remove beat tag
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BeatTagSelector;
