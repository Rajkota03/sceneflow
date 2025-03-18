
import React from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ActType, ActCountsRecord } from '@/lib/types';
import { Badge } from './ui/badge';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Eye, EyeOff } from 'lucide-react';
import { BeatMode } from '@/types/scriptTypes';

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
}) => {
  const handleStructureChange = (value: string) => {
    if (onStructureChange) {
      onStructureChange(value);
    }
  };

  const getBadgeStyle = (actType: ActType) => {
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
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-700";
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
        
        {Object.values(ActType).map((actType) => (
          <Badge
            key={actType}
            variant="outline"
            className={`px-3 cursor-pointer ${getBadgeStyle(actType)} ${activeAct === actType ? 'ring-2 ring-offset-1' : ''}`}
            onClick={() => onSelectAct(actType)}
          >
            {actType === ActType.ACT_1 && "Act 1"}
            {actType === ActType.ACT_2A && "Act 2A"}
            {actType === ActType.MIDPOINT && "Midpoint"}
            {actType === ActType.ACT_2B && "Act 2B"}
            {actType === ActType.ACT_3 && "Act 3"}
            
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
