import React, { useState, useEffect } from 'react';
import { ActType, Structure } from '@/lib/types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Zap, ZapOff, Check, Film, BookOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from './ui/use-toast';
import { ActCountsRecord } from '@/types/scriptTypes';
import { Badge } from './ui/badge';

// Define the BeatMode type to ensure consistent usage
type BeatMode = 'on' | 'off';

interface ActBarProps {
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  actCounts: ActCountsRecord;
  projectName?: string;
  structureName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  availableStructures?: { id: string; name: string }[];
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  selectedStructure?: Structure | null;
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct,
  actCounts,
  projectName = "Untitled Project",
  structureName = "Three Act Structure",
  beatMode = 'on',
  onToggleBeatMode,
  availableStructures = [],
  onStructureChange,
  selectedStructureId,
  selectedStructure
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Default Three Act Structure
  const defaultActs = [
    { id: ActType.ACT_1, label: 'Act 1', color: 'bg-[#D3E4FD] hover:bg-[#B8D2F8] border-[#4A90E2]' },
    { id: ActType.ACT_2A, label: 'Act 2A', color: 'bg-[#FEF7CD] hover:bg-[#FDF0B0] border-[#F5A623]' },
    { id: ActType.MIDPOINT, label: 'Midpoint', color: 'bg-[#FFCCCB] hover:bg-[#FFB9B8] border-[#FF9E9D]' },
    { id: ActType.ACT_2B, label: 'Act 2B', color: 'bg-[#FDE1D3] hover:bg-[#FCCEB8] border-[#F57C00]' },
    { id: ActType.ACT_3, label: 'Act 3', color: 'bg-[#F2FCE2] hover:bg-[#E5F8C8] border-[#009688]' },
  ];
  
  // Get structure-specific acts if a structure is selected
  const getStructureSpecificActs = () => {
    if (!selectedStructure) return defaultActs;
    
    // For "Save the Cat" structure, use a simplified view
    if (selectedStructure.structure_type === 'save_the_cat') {
      return [
        { id: ActType.ACT_1, label: 'Setup', color: 'bg-[#D3E4FD] hover:bg-[#B8D2F8] border-[#4A90E2]' },
        { id: ActType.ACT_2A, label: 'Confrontation I', color: 'bg-[#FEF7CD] hover:bg-[#FDF0B0] border-[#F5A623]' },
        { id: ActType.MIDPOINT, label: 'Midpoint', color: 'bg-[#FFCCCB] hover:bg-[#FFB9B8] border-[#FF9E9D]' },
        { id: ActType.ACT_2B, label: 'Confrontation II', color: 'bg-[#FDE1D3] hover:bg-[#FCCEB8] border-[#F57C00]' },
        { id: ActType.ACT_3, label: 'Resolution', color: 'bg-[#F2FCE2] hover:bg-[#E5F8C8] border-[#009688]' },
      ];
    }
    
    // For Hero's Journey structure
    if (selectedStructure.structure_type === 'hero_journey') {
      return [
        { id: ActType.ACT_1, label: 'Departure', color: 'bg-[#10b981] hover:bg-[#0d9669] border-[#064e36] text-white' },
        { id: ActType.ACT_2A, label: 'Initiation I', color: 'bg-[#f59e0b] hover:bg-[#d48806] border-[#8c5a04] text-white' },
        { id: ActType.MIDPOINT, label: 'Supreme Ordeal', color: 'bg-[#ef4444] hover:bg-[#b91c1c] border-[#7f1d1d] text-white' },
        { id: ActType.ACT_2B, label: 'Initiation II', color: 'bg-[#f59e0b] hover:bg-[#d48806] border-[#8c5a04] text-white' },
        { id: ActType.ACT_3, label: 'Return', color: 'bg-[#ef4444] hover:bg-[#b91c1c] border-[#7f1d1d] text-white' },
      ];
    }
    
    // For Story Circle structure
    if (selectedStructure.structure_type === 'story_circle') {
      return [
        { id: ActType.ACT_1, label: 'Need', color: 'bg-[#ec4899] hover:bg-[#db2777] border-[#9d174d] text-white' },
        { id: ActType.ACT_2A, label: 'Go', color: 'bg-[#a855f7] hover:bg-[#9333ea] border-[#6b21a8] text-white' },
        { id: ActType.MIDPOINT, label: 'Find', color: 'bg-[#3b82f6] hover:bg-[#2563eb] border-[#1d4ed8] text-white' },
        { id: ActType.ACT_2B, label: 'Take', color: 'bg-[#a855f7] hover:bg-[#9333ea] border-[#6b21a8] text-white' },
        { id: ActType.ACT_3, label: 'Return', color: 'bg-[#ec4899] hover:bg-[#db2777] border-[#9d174d] text-white' },
      ];
    }
    
    return defaultActs;
  };
  
  const acts = getStructureSpecificActs();

  const handleBeatModeToggle = (value: BeatMode) => {
    if (onToggleBeatMode) {
      onToggleBeatMode(value);
    }
  };

  const handleStructureChange = (value: string) => {
    if (onStructureChange) {
      onStructureChange(value);
    } else {
      toast({
        title: "Structure Selection",
        description: "Please go to the Structure page to edit this structure",
      });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-slate-50 rounded-md shadow-sm mb-3 w-full">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2">
                <Film size={16} className="mr-2 text-slate-600" />
                <h3 className="text-sm font-medium text-slate-700 mr-1">Story Structure</h3>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </CollapsibleTrigger>
            <Badge variant="outline" className="ml-2 bg-white">
              <span className="text-xs font-medium text-slate-600">{projectName}</span>
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {availableStructures.length > 0 && (
              <Select 
                value={selectedStructureId} 
                onValueChange={handleStructureChange}
              >
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <BookOpen size={14} className="mr-2 text-slate-500" />
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  {availableStructures.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id} className="text-xs">
                      {structure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {structureName && (
              <span className="text-sm font-medium text-slate-600 hidden md:inline">{structureName}</span>
            )}
            
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
                  <span className="hidden md:inline">Beat Mode</span>
                  {beatMode === 'on' && <Check size={14} className="ml-1" />}
                </Button>
                
                <Button
                  variant={beatMode === 'off' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBeatModeToggle('off')}
                  className="h-7 flex items-center gap-1 text-xs"
                >
                  <ZapOff size={14} />
                  <span className="hidden md:inline">Free Mode</span>
                  {beatMode === 'off' && <Check size={14} className="ml-1" />}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <CollapsibleContent>
          {beatMode === 'on' && (
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
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ActBar;
