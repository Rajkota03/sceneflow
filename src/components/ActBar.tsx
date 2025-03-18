import React, { useState, useEffect } from 'react';
import { ActType, Structure } from '@/lib/types';
import { Button } from './ui/button';
import { BeatMode } from '@/types/scriptTypes';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { FileText, BookText, List } from 'lucide-react';

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
  availableStructures?: Array<{ id: string; name: string }>;
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  selectedStructure?: Structure | null;
}

const generateColorForIndex = (index: number, total: number): string => {
  const colors = [
    'bg-blue-500 hover:bg-blue-600',
    'bg-purple-500 hover:bg-purple-600',
    'bg-green-500 hover:bg-green-600',
    'bg-rose-500 hover:bg-rose-600',
    'bg-amber-500 hover:bg-amber-600',
    'bg-teal-500 hover:bg-teal-600',
    'bg-indigo-500 hover:bg-indigo-600',
    'bg-pink-500 hover:bg-pink-600',
  ];
  
  if (index < colors.length) {
    return colors[index];
  }
  
  return colors[index % colors.length];
};

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct, 
  actCounts,
  projectName,
  structureName,
  beatMode = 'on',
  onToggleBeatMode,
  availableStructures = [],
  onStructureChange,
  selectedStructureId,
  selectedStructure
}) => {
  const [showAllActs, setShowAllActs] = useState(false);
  const [actButtons, setActButtons] = useState<Array<{
    id: string;
    label: string;
    color: string;
  }>>([]);
  
  useEffect(() => {
    if (selectedStructure && selectedStructure.acts && Array.isArray(selectedStructure.acts) && selectedStructure.acts.length > 0) {
      console.log("Selected structure in ActBar:", selectedStructure.name);
      console.log("Number of acts:", selectedStructure.acts.length);
      
      const buttons = selectedStructure.acts.map((act, index) => ({
        id: act.id,
        label: act.title || `Act ${index + 1}`,
        color: generateColorForIndex(index, selectedStructure.acts.length)
      }));
      
      setActButtons(buttons);
    } else {
      console.log("No valid structure acts found, using default");
      setActButtons([
        { id: 'act1', label: 'ACT 1', color: 'bg-blue-500 hover:bg-blue-600' },
        { id: 'act2a', label: 'ACT 2A', color: 'bg-purple-500 hover:bg-purple-600' },
        { id: 'midpoint', label: 'MIDPOINT', color: 'bg-green-500 hover:bg-green-600' },
        { id: 'act2b', label: 'ACT 2B', color: 'bg-rose-500 hover:bg-rose-600' },
        { id: 'act3', label: 'ACT 3', color: 'bg-amber-500 hover:bg-amber-600' }
      ]);
    }
  }, [selectedStructure]);
  
  const visibleActs = showAllActs ? actButtons : actButtons.slice(0, 4);
  
  const handleToggleBeatMode = () => {
    if (onToggleBeatMode) {
      onToggleBeatMode(beatMode === 'on' ? 'off' : 'on');
    }
  };
  
  const handleStructureChange = (value: string) => {
    if (onStructureChange) {
      onStructureChange(value);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h3 className="text-sm font-medium mr-3 text-gray-700 dark:text-gray-300">
            {projectName}
          </h3>
          
          {availableStructures && availableStructures.length > 0 && onStructureChange && (
            <div className="relative flex-shrink-0 w-64">
              <Select 
                value={selectedStructureId} 
                onValueChange={handleStructureChange}
              >
                <SelectTrigger className="h-8 text-xs bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  {availableStructures.map(structure => (
                    <SelectItem 
                      key={structure.id} 
                      value={structure.id}
                      className="text-xs"
                    >
                      {structure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {onToggleBeatMode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleBeatMode}
                  className={`h-8 px-2 ${beatMode === 'on' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  {beatMode === 'on' ? (
                    <BookText size={16} className="mr-1" />
                  ) : (
                    <FileText size={16} className="mr-1" />
                  )}
                  {beatMode === 'on' ? 'Beats On' : 'Beats Off'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle beat tracking mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
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
          
          const handleActClick = () => {
            onSelectAct(actBtn.id as ActType);
          };
          
          return (
            <TooltipProvider key={actBtn.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeAct === actBtn.id ? "default" : "outline"}
                    size="sm"
                    onClick={handleActClick}
                    className={`h-7 px-3 text-xs text-white ${
                      activeAct === actBtn.id 
                        ? actBtn.color 
                        : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {actBtn.label}
                    {count > 0 && (
                      <span className="ml-1 opacity-80">({count})</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show only scenes in {actBtn.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        
        {actButtons.length > 4 && (
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

