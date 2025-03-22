
import React, { useState, useEffect } from 'react';
import { ActType, Structure } from '@/lib/types';
import { Button } from '../ui/button';
import { BeatMode } from '@/types/scriptTypes';
import { 
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { List } from 'lucide-react';
import StructureBar from './StructureBar';
import ActButton from './ActButton';
import BeatModeToggle from './BeatModeToggle';
import StructureSelector from './StructureSelector';

interface ActCount {
  act: ActType | null;
  count: number;
}

interface ActBarProps {
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  actCounts: ActCount[];
  projectName?: string;
  structureName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  selectedStructure?: Structure | null;
  beatSceneCounts?: Record<string, number>;
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  availableStructures?: Array<{ id: string; name: string }>;
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct, 
  actCounts,
  projectName,
  structureName,
  beatMode = 'on',
  onToggleBeatMode,
  selectedStructure,
  beatSceneCounts = {},
  onStructureChange,
  selectedStructureId,
  availableStructures = []
}) => {
  const [showAllActs, setShowAllActs] = useState(false);
  const [actButtons, setActButtons] = useState<Array<{
    id: string;
    label: string;
    color: string;
    bgColor: string;
    beatIds: string[];
  }>>([]);
  
  // Default structure colors
  const defaultActColors = [
    { id: 'act1', label: 'ACT 1', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    { id: 'act2a', label: 'ACT 2A', color: 'text-amber-800', bgColor: 'bg-amber-100' },
    { id: 'midpoint', label: 'MIDPOINT', color: 'text-pink-800', bgColor: 'bg-pink-100' },
    { id: 'act2b', label: 'ACT 2B', color: 'text-orange-800', bgColor: 'bg-orange-100' },
    { id: 'act3', label: 'ACT 3', color: 'text-green-800', bgColor: 'bg-green-100' }
  ];
  
  useEffect(() => {
    if (selectedStructure && selectedStructure.acts && Array.isArray(selectedStructure.acts) && selectedStructure.acts.length > 0) {
      console.log("Selected structure in ActBar:", selectedStructure.name);
      console.log("Number of acts:", selectedStructure.acts.length);
      
      const buttons = selectedStructure.acts.map((act, index) => {
        const defaultColor = defaultActColors[index] || defaultActColors[0];
        return {
          id: act.id,
          label: act.title || `Act ${index + 1}`,
          color: defaultColor.color,
          bgColor: defaultColor.bgColor,
          beatIds: act.beats?.map(b => b.id) || []
        };
      });
      
      setActButtons(buttons);
    } else {
      console.log("No valid structure acts found, using default");
      setActButtons(defaultActColors.map(ac => ({ 
        ...ac, 
        beatIds: [] 
      })));
    }
  }, [selectedStructure]);
  
  const visibleActs = showAllActs ? actButtons : actButtons.slice(0, 5);
  
  // Calculate total beat count for each act
  const getActBeatCount = (actButton: typeof actButtons[0]) => {
    if (!actButton.beatIds.length) return 0;
    
    let count = 0;
    for (const beatId of actButton.beatIds) {
      count += beatSceneCounts[beatId] || 0;
    }
    return count;
  };
  
  // Create StructureBar data structure
  const structureBarButtons = visibleActs.map(act => {
    const beatCount = getActBeatCount(act);
    return {
      id: act.id,
      label: act.label + (beatCount > 0 ? ` (${beatCount})` : ''),
      color: act.color,
      bgColor: act.bgColor,
      isActive: activeAct === act.id as ActType,
      onClick: () => onSelectAct(act.id as ActType)
    };
  });
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h3 className="text-sm font-medium mr-3 text-gray-700 dark:text-gray-300">
            {projectName}
          </h3>
          
          {availableStructures && availableStructures.length > 0 && onStructureChange && (
            <StructureSelector
              structures={availableStructures}
              selectedStructureId={selectedStructureId}
              onStructureChange={onStructureChange}
            />
          )}
        </div>
        
        {onToggleBeatMode && (
          <BeatModeToggle
            beatMode={beatMode}
            onToggleBeatMode={onToggleBeatMode}
          />
        )}
      </div>
      
      {/* Story Structure Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <h3 className="text-sm font-medium mr-2 text-gray-700 dark:text-gray-300">
              Story Structure
            </h3>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400"
          >
            Free Mode
          </Button>
        </div>
        
        {/* Structure Bar with properly typed props */}
        <StructureBar
          buttons={structureBarButtons}
        />
      </div>
      
      {/* Button filters for quick navigation */}
      <div className="flex flex-wrap items-center space-x-2 mb-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeAct === null ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectAct(null)}
                className="h-7 px-3 text-xs bg-gray-800 hover:bg-gray-700 text-white"
              >
                ALL
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show all scenes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {visibleActs.map((actBtn) => {
          const actCount = actCounts.find(
            count => count.act === actBtn.id
          );
          const count = actCount ? actCount.count : 0;
          const beatCount = getActBeatCount(actBtn);
          
          return (
            <ActButton
              key={actBtn.id}
              id={actBtn.id}
              label={actBtn.label}
              color={actBtn.color}
              bgColor={actBtn.bgColor}
              isActive={activeAct === actBtn.id}
              count={count}
              beatCount={beatCount}
              onClick={() => onSelectAct(actBtn.id as ActType)}
            />
          );
        })}
        
        {actButtons.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllActs(!showAllActs)}
            className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400"
          >
            <List size={16} />
            <span className="ml-1">{showAllActs ? 'Less' : 'More'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActBar;
