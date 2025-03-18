
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
    bgColor: string;
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
          bgColor: defaultColor.bgColor
        };
      });
      
      setActButtons(buttons);
    } else {
      console.log("No valid structure acts found, using default");
      setActButtons(defaultActColors);
    }
  }, [selectedStructure]);
  
  const visibleActs = showAllActs ? actButtons : actButtons.slice(0, 5);
  
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
                  {beatMode === 'on' ? 'Beat Mode' : 'Script Mode'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle beat tracking mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        
        {/* Structure Bar */}
        <div className="flex rounded-lg overflow-hidden w-full mb-2 border border-gray-200 dark:border-gray-700">
          {visibleActs.map((actBtn, index) => {
            const isActive = activeAct === actBtn.id;
            const handleActClick = () => {
              onSelectAct(actBtn.id as ActType);
            };
            
            return (
              <div 
                key={actBtn.id}
                onClick={handleActClick}
                className={`${actBtn.bgColor} ${isActive ? 'ring-2 ring-inset ring-blue-500' : ''} flex-grow text-center py-2 cursor-pointer transition-all hover:brightness-95 active:brightness-90`}
                style={{ flex: 1 }}
              >
                <span className={`text-sm font-medium ${actBtn.color}`}>
                  {actBtn.label}
                </span>
              </div>
            );
          })}
        </div>
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
                    className={`h-7 px-3 text-xs ${
                      activeAct === actBtn.id 
                        ? `${actBtn.bgColor} ${actBtn.color}`
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
