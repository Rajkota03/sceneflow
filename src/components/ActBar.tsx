
import React from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ActType, StructureType } from '@/lib/types';
import { Badge } from './ui/badge';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Eye, EyeOff } from 'lucide-react';
import { BeatMode } from '@/types/scriptTypes';

interface ActCountsRecord {
  [key in ActType]: number;
}

// Map structure types to their respective act types
const structureActMapping: Record<StructureType, ActType[]> = {
  three_act: [ActType.ACT_1, ActType.ACT_2A, ActType.MIDPOINT, ActType.ACT_2B, ActType.ACT_3],
  save_the_cat: [ActType.OPENING_IMAGE, ActType.SETUP, ActType.CATALYST, ActType.DEBATE, ActType.BREAK_INTO_2, 
                ActType.B_STORY, ActType.FUN_AND_GAMES, ActType.MIDPOINT, ActType.BAD_GUYS_CLOSE_IN, 
                ActType.ALL_IS_LOST, ActType.DARK_NIGHT_OF_SOUL, ActType.BREAK_INTO_3, ActType.FINALE],
  heroes_journey: [ActType.ORDINARY_WORLD, ActType.CALL_TO_ADVENTURE, ActType.REFUSAL, ActType.MENTOR, 
                ActType.CROSSING_THRESHOLD, ActType.TESTS_ALLIES_ENEMIES, ActType.APPROACH, 
                ActType.ORDEAL, ActType.REWARD, ActType.ROAD_BACK, ActType.RESURRECTION, ActType.RETURN],
  story_circle: [ActType.YOU, ActType.NEED, ActType.GO, ActType.SEARCH, 
                ActType.FIND, ActType.TAKE, ActType.RETURN, ActType.CHANGE]
};

interface ActBarProps {
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  actCounts: ActCountsRecord;
  projectName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  availableStructures?: Array<{ id: string, name: string }>;
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  selectedStructureType?: StructureType;
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct, 
  actCounts, 
  projectName,
  beatMode = 'on',
  onToggleBeatMode,
  availableStructures = [],
  onStructureChange,
  selectedStructureId,
  selectedStructureType = 'three_act'
}) => {
  const handleStructureChange = (value: string) => {
    if (onStructureChange) {
      onStructureChange(value);
    }
  };

  // Get the appropriate act types based on the selected structure type
  const relevantActTypes = structureActMapping[selectedStructureType] || structureActMapping.three_act;

  const getBadgeStyle = (actType: ActType) => {
    // Default style
    return "bg-gray-100 hover:bg-gray-200 text-gray-700";
  };

  const getActLabel = (actType: ActType) => {
    switch (actType) {
      // Three Act Structure
      case ActType.ACT_1: return "Act 1";
      case ActType.ACT_2A: return "Act 2A";
      case ActType.MIDPOINT: return "Midpoint";
      case ActType.ACT_2B: return "Act 2B";
      case ActType.ACT_3: return "Act 3";
      
      // Save The Cat
      case ActType.OPENING_IMAGE: return "Opening Image";
      case ActType.SETUP: return "Setup";
      case ActType.CATALYST: return "Catalyst";
      case ActType.DEBATE: return "Debate";
      case ActType.BREAK_INTO_2: return "Break Into 2";
      case ActType.B_STORY: return "B Story";
      case ActType.FUN_AND_GAMES: return "Fun & Games";
      case ActType.BAD_GUYS_CLOSE_IN: return "Bad Guys Close In";
      case ActType.ALL_IS_LOST: return "All Is Lost";
      case ActType.DARK_NIGHT_OF_SOUL: return "Dark Night of Soul";
      case ActType.BREAK_INTO_3: return "Break Into 3";
      case ActType.FINALE: return "Finale";
      
      // Hero's Journey
      case ActType.ORDINARY_WORLD: return "Ordinary World";
      case ActType.CALL_TO_ADVENTURE: return "Call to Adventure";
      case ActType.REFUSAL: return "Refusal of the Call";
      case ActType.MENTOR: return "Meeting the Mentor";
      case ActType.CROSSING_THRESHOLD: return "Crossing the Threshold";
      case ActType.TESTS_ALLIES_ENEMIES: return "Tests, Allies, Enemies";
      case ActType.APPROACH: return "Approach to Inmost Cave";
      case ActType.ORDEAL: return "Ordeal";
      case ActType.REWARD: return "Reward";
      case ActType.ROAD_BACK: return "Road Back";
      case ActType.RESURRECTION: return "Resurrection";
      case ActType.RETURN: return "Return with Elixir";
      
      // Story Circle
      case ActType.YOU: return "You";
      case ActType.NEED: return "Need";
      case ActType.GO: return "Go";
      case ActType.SEARCH: return "Search";
      case ActType.FIND: return "Find";
      case ActType.TAKE: return "Take";
      case ActType.CHANGE: return "Change";
      
      default: return actType;
    }
  };

  return (
    <div className="act-bar flex items-center flex-wrap gap-3">
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className={`px-3 py-1 h-8 text-xs font-medium ${activeAct === null ? 'bg-gray-100' : ''}`}
          onClick={() => onSelectAct(null)}
        >
          All Scenes
        </Button>
        
        {beatMode === 'on' && relevantActTypes.map((actType) => (
          <Badge
            key={actType}
            variant="outline"
            className={`px-3 cursor-pointer ${getBadgeStyle(actType)} ${activeAct === actType ? 'ring-2 ring-offset-1' : ''}`}
            onClick={() => onSelectAct(actType)}
          >
            {getActLabel(actType)}
            
            {actCounts[actType] > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white bg-opacity-60">
                {actCounts[actType]}
              </span>
            )}
          </Badge>
        ))}
      </div>
      
      <div className="flex-grow"></div>

      {availableStructures.length > 0 && onStructureChange && (
        <Select
          value={selectedStructureId}
          onValueChange={handleStructureChange}
        >
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Select structure" />
          </SelectTrigger>
          <SelectContent>
            {availableStructures.map(structure => (
              <SelectItem key={structure.id} value={structure.id} className="text-xs">
                {structure.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {onToggleBeatMode && (
        <ToggleGroup type="single" value={beatMode} onValueChange={(value: any) => onToggleBeatMode(value)}>
          <ToggleGroupItem value="on" size="sm" className="h-8 px-2">
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-xs">Show Beats</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="off" size="sm" className="h-8 px-2">
            <EyeOff className="h-4 w-4 mr-1" />
            <span className="text-xs">Hide Beats</span>
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  );
};

export default ActBar;
