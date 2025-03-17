
import React, { useState } from 'react';
import { Structure, Act, Beat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface BeatSelectorProps {
  selectedStructure: Structure | null;
  elementId: string;
  onBeatTag: (elementId: string, beatId: string, actId: string) => void;
  selectedBeatId?: string;
}

const BeatSelector: React.FC<BeatSelectorProps> = ({
  selectedStructure,
  elementId,
  onBeatTag,
  selectedBeatId
}) => {
  const [open, setOpen] = useState(false);
  
  if (!selectedStructure) {
    return null;
  }

  // Find the currently selected beat
  let selectedBeat: { beat: Beat, act: Act } | null = null;
  
  if (selectedBeatId) {
    for (const act of selectedStructure.acts) {
      const beat = act.beats.find(b => b.id === selectedBeatId);
      if (beat) {
        selectedBeat = { beat, act };
        break;
      }
    }
  }

  const handleBeatSelect = (beatId: string, actId: string) => {
    onBeatTag(elementId, beatId, actId);
    setOpen(false);
    toast({
      title: "Beat tagged",
      description: "This scene has been tagged with the selected beat.",
    });
  };

  // Functions to get act color and icon based on structure type
  const getActColor = (act: Act): string => {
    const structureType = selectedStructure.structure_type;
    const actTitle = act.title.toLowerCase();
    
    if (structureType === 'save_the_cat') {
      if (actTitle.includes('act 1') || actTitle.includes('setup')) 
        return 'bg-blue-100 text-blue-800 border-blue-300';
      if (actTitle.includes('act 2a') || actTitle.includes('confrontation i')) 
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      if (actTitle.includes('midpoint')) 
        return 'bg-purple-100 text-purple-800 border-purple-300';
      if (actTitle.includes('act 2b') || actTitle.includes('confrontation ii')) 
        return 'bg-amber-100 text-amber-800 border-amber-300';
      if (actTitle.includes('act 3') || actTitle.includes('resolution')) 
        return 'bg-green-100 text-green-800 border-green-300';
    } else if (structureType === 'hero_journey') {
      if (actTitle.includes('departure')) 
        return 'bg-green-100 text-green-800 border-green-300';
      if (actTitle.includes('initiation')) 
        return 'bg-orange-100 text-orange-800 border-orange-300';
      if (actTitle.includes('ordeal')) 
        return 'bg-red-100 text-red-800 border-red-300';
      if (actTitle.includes('return')) 
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
    
    // Default colors for three-act structure
    if (actTitle.includes('act 1')) 
      return 'bg-blue-100 text-blue-800 border-blue-300';
    if (actTitle.includes('act 2a')) 
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (actTitle.includes('midpoint')) 
      return 'bg-purple-100 text-purple-800 border-purple-300';
    if (actTitle.includes('act 2b')) 
      return 'bg-amber-100 text-amber-800 border-amber-300';
    if (actTitle.includes('act 3')) 
      return 'bg-green-100 text-green-800 border-green-300';
    
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="mt-2 mb-3">
      <div className="flex items-center text-gray-500 mb-1">
        <Target size={14} className="mr-1" />
        <span className="text-xs font-medium">Story Beat</span>
      </div>
      
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between text-xs h-8"
          >
            {selectedBeat ? (
              <div className="flex items-center">
                <Badge variant="outline" className={cn("mr-2 font-normal", getActColor(selectedBeat.act))}>
                  {selectedBeat.act.title}
                </Badge>
                <span className="truncate">{selectedBeat.beat.title}</span>
              </div>
            ) : (
              <span className="text-gray-500">Select a story beat</span>
            )}
            <ChevronDown size={14} className="ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          {selectedStructure.acts.map((act) => (
            <React.Fragment key={act.id}>
              <DropdownMenuLabel 
                className={cn("flex items-center", getActColor(act))}
                style={{ color: act.colorHex || undefined }}
              >
                {act.title}
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {act.beats.map((beat) => (
                  <DropdownMenuItem
                    key={beat.id}
                    className="flex items-center text-sm cursor-pointer"
                    onClick={() => handleBeatSelect(beat.id, act.id)}
                  >
                    <span className="truncate">{beat.title}</span>
                    {selectedBeatId === beat.id && (
                      <Check size={14} className="ml-auto text-green-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BeatSelector;
