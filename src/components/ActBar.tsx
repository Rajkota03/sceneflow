
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ActType, ActCountsRecord, StructureType } from '@/lib/types';
import { Badge } from './ui/badge';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { BeatMode } from '@/types/scriptTypes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

// Map structure types to their respective act types
const structureActMapping: Record<StructureType, ActType[]> = {
  three_act: [ActType.ACT_1, ActType.ACT_2A, ActType.MIDPOINT, ActType.ACT_2B, ActType.ACT_3],
  save_the_cat: [ActType.OPENING_IMAGE, ActType.SETUP, ActType.CATALYST, ActType.DEBATE, ActType.BREAK_INTO_2, 
                ActType.B_STORY, ActType.FUN_AND_GAMES, ActType.MIDPOINT, ActType.BAD_GUYS_CLOSE_IN, 
                ActType.ALL_IS_LOST, ActType.DARK_NIGHT_OF_SOUL, ActType.BREAK_INTO_3, ActType.FINALE],
  hero_journey: [ActType.ORDINARY_WORLD, ActType.CALL_TO_ADVENTURE, ActType.REFUSAL, ActType.MENTOR, 
                ActType.CROSSING_THRESHOLD, ActType.TESTS_ALLIES_ENEMIES, ActType.APPROACH, 
                ActType.ORDEAL, ActType.REWARD, ActType.ROAD_BACK, ActType.RESURRECTION, ActType.RETURN],
  story_circle: [ActType.YOU, ActType.NEED, ActType.GO, ActType.SEARCH, 
                ActType.FIND, ActType.TAKE, ActType.RETURN, ActType.CHANGE]
};

// Group act types by major acts for each structure type
const structureActGroups: Record<StructureType, Record<string, ActType[]>> = {
  three_act: {
    'Act 1': [ActType.ACT_1],
    'Act 2': [ActType.ACT_2A, ActType.MIDPOINT, ActType.ACT_2B],
    'Act 3': [ActType.ACT_3]
  },
  save_the_cat: {
    'Act 1': [ActType.OPENING_IMAGE, ActType.SETUP, ActType.CATALYST, ActType.DEBATE, ActType.BREAK_INTO_2],
    'Act 2': [ActType.B_STORY, ActType.FUN_AND_GAMES, ActType.MIDPOINT, ActType.BAD_GUYS_CLOSE_IN, ActType.ALL_IS_LOST, ActType.DARK_NIGHT_OF_SOUL],
    'Act 3': [ActType.BREAK_INTO_3, ActType.FINALE]
  },
  hero_journey: {
    'Departure': [ActType.ORDINARY_WORLD, ActType.CALL_TO_ADVENTURE, ActType.REFUSAL, ActType.MENTOR, ActType.CROSSING_THRESHOLD],
    'Initiation': [ActType.TESTS_ALLIES_ENEMIES, ActType.APPROACH, ActType.ORDEAL, ActType.REWARD],
    'Return': [ActType.ROAD_BACK, ActType.RESURRECTION, ActType.RETURN]
  },
  story_circle: {
    'First Half': [ActType.YOU, ActType.NEED, ActType.GO, ActType.SEARCH],
    'Second Half': [ActType.FIND, ActType.TAKE, ActType.RETURN, ActType.CHANGE]
  }
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Act 1': true,
    'Act 2': true,
    'Act 3': true,
    'Departure': true,
    'Initiation': true,
    'Return': true,
    'First Half': true,
    'Second Half': true
  });
  
  const handleStructureChange = (value: string) => {
    if (onStructureChange) {
      onStructureChange(value);
    }
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const getBadgeStyle = (actType: ActType) => {
    // Colors for Three Act Structure
    if (structureActMapping.three_act.includes(actType)) {
      switch (actType) {
        case ActType.ACT_1:
          return "bg-[#D3E4FD] hover:bg-[#C2D6F5] text-[#2171D2]";
        case ActType.ACT_2A:
          return "bg-[#FEF7CD] hover:bg-[#F5EEB9] text-[#D28A21]";
        case ActType.MIDPOINT:
          return "bg-[#FFCCCB] hover:bg-[#FFBCBB] text-[#D24E4D]";
        case ActType.ACT_2B:
          return "bg-[#FDE1D3] hover:bg-[#F5D4C4] text-[#D26600]";
        case ActType.ACT_3:
          return "bg-[#F2FCE2] hover:bg-[#E3F2CE] text-[#007F73]";
      }
    }
    
    // Colors for Save The Cat
    if (structureActMapping.save_the_cat.includes(actType)) {
      // Act 1 (Blue shades)
      if ([ActType.OPENING_IMAGE, ActType.SETUP, ActType.CATALYST, ActType.DEBATE, ActType.BREAK_INTO_2].includes(actType)) {
        return "bg-[#D3E4FD] hover:bg-[#C2D6F5] text-[#2171D2]";
      }
      // Act 2 First Half (Yellow shades)
      else if ([ActType.B_STORY, ActType.FUN_AND_GAMES, ActType.MIDPOINT].includes(actType)) {
        return "bg-[#FEF7CD] hover:bg-[#F5EEB9] text-[#D28A21]";
      }
      // Act 2 Second Half (Orange shades)
      else if ([ActType.BAD_GUYS_CLOSE_IN, ActType.ALL_IS_LOST, ActType.DARK_NIGHT_OF_SOUL].includes(actType)) {
        return "bg-[#FDE1D3] hover:bg-[#F5D4C4] text-[#D26600]";
      }
      // Act 3 (Green shades)
      else if ([ActType.BREAK_INTO_3, ActType.FINALE].includes(actType)) {
        return "bg-[#F2FCE2] hover:bg-[#E3F2CE] text-[#007F73]";
      }
    }
    
    // Colors for Hero's Journey
    if (structureActMapping.hero_journey.includes(actType)) {
      // Departure (Blue shades)
      if ([ActType.ORDINARY_WORLD, ActType.CALL_TO_ADVENTURE, ActType.REFUSAL, ActType.MENTOR, ActType.CROSSING_THRESHOLD].includes(actType)) {
        return "bg-[#D3E4FD] hover:bg-[#C2D6F5] text-[#2171D2]";
      }
      // Initiation (Yellow to Orange gradient)
      else if ([ActType.TESTS_ALLIES_ENEMIES, ActType.APPROACH].includes(actType)) {
        return "bg-[#FEF7CD] hover:bg-[#F5EEB9] text-[#D28A21]";
      }
      else if ([ActType.ORDEAL, ActType.REWARD].includes(actType)) {
        return "bg-[#FDE1D3] hover:bg-[#F5D4C4] text-[#D26600]";
      }
      // Return (Green shades)
      else if ([ActType.ROAD_BACK, ActType.RESURRECTION, ActType.RETURN].includes(actType)) {
        return "bg-[#F2FCE2] hover:bg-[#E3F2CE] text-[#007F73]";
      }
    }
    
    // Colors for Story Circle
    if (structureActMapping.story_circle.includes(actType)) {
      // First Half (Blue to Yellow)
      if ([ActType.YOU, ActType.NEED].includes(actType)) {
        return "bg-[#D3E4FD] hover:bg-[#C2D6F5] text-[#2171D2]";
      }
      else if ([ActType.GO, ActType.SEARCH].includes(actType)) {
        return "bg-[#FEF7CD] hover:bg-[#F5EEB9] text-[#D28A21]";
      }
      // Second Half (Orange to Green)
      else if ([ActType.FIND, ActType.TAKE].includes(actType)) {
        return "bg-[#FDE1D3] hover:bg-[#F5D4C4] text-[#D26600]";
      }
      else if ([ActType.RETURN, ActType.CHANGE].includes(actType)) {
        return "bg-[#F2FCE2] hover:bg-[#E3F2CE] text-[#007F73]";
      }
    }
    
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

  const getActGroups = () => {
    const groups = structureActGroups[selectedStructureType];
    return Object.entries(groups);
  };

  const getStructureDisplayName = (type: StructureType): string => {
    switch (type) {
      case 'three_act': return 'Three-Act Structure';
      case 'save_the_cat': return 'Save The Cat';
      case 'hero_journey': return 'Hero\'s Journey';
      case 'story_circle': return 'Story Circle';
      default: return 'Structure';
    }
  };

  return (
    <div className="act-bar flex flex-col space-y-2 w-full">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className={`px-3 py-1 h-8 text-xs font-medium ${activeAct === null ? 'bg-gray-100' : ''}`}
          onClick={() => onSelectAct(null)}
        >
          All Scenes
        </Button>
        
        <div className="flex items-center space-x-2">
          {availableStructures.length > 0 && onStructureChange && (
            <Select
              value={selectedStructureId}
              onValueChange={handleStructureChange}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder={getStructureDisplayName(selectedStructureType)} />
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
            <ToggleGroup type="single" value={beatMode} onValueChange={(value: any) => value && onToggleBeatMode(value)}>
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
      </div>

      {beatMode === 'on' && (
        <div className="flex flex-col space-y-1 overflow-hidden">
          {getActGroups().map(([groupName, actTypes]) => (
            <Collapsible key={groupName} open={openGroups[groupName]} onOpenChange={() => toggleGroup(groupName)}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded cursor-pointer">
                  <span className="text-sm font-medium">{groupName}</span>
                  {openGroups[groupName] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-wrap gap-1 mt-1 pl-2">
                  {actTypes.map((actType) => (
                    <Badge
                      key={actType}
                      variant="outline"
                      className={`px-3 py-1 cursor-pointer ${getBadgeStyle(actType)} ${activeAct === actType ? 'ring-2 ring-offset-1' : ''}`}
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
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActBar;
