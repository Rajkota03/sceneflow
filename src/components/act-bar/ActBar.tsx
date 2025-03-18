
import React, { useState, useEffect } from 'react';
import { ActType, Structure } from '@/lib/types';
import { Button } from '../ui/button';
import { 
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { List } from 'lucide-react';
import StructureBar from './StructureBar';
import ActButton from './ActButton';
import { ActCountsRecord } from '@/types/scriptTypes';

interface ActCount {
  act: ActType;
  count: number;
}

interface ActBarProps {
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  actCounts: ActCount[];
  projectName?: string;
  structureName?: string;
  selectedStructure?: Structure | null;
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct, 
  actCounts,
  projectName,
  structureName,
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
  
  // Create an array of StructureBarButtonProps objects
  const structureBarButtons = visibleActs.map(act => ({
    ...act,
    isActive: activeAct === act.id as ActType,
    onClick: () => onSelectAct(act.id as ActType)
  }));
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h3 className="text-sm font-medium mr-3 text-gray-700 dark:text-gray-300">
            {projectName}
          </h3>
          
          {selectedStructure && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Structure: {selectedStructure.name}
            </span>
          )}
        </div>
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
        
        {/* Structure Bar - Fixed with properly typed props */}
        <StructureBar
          visibleActs={structureBarButtons}
          activeAct={activeAct}
          onSelectAct={onSelectAct}
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
            count => count.act === actBtn.id as ActType
          );
          const count = actCount ? actCount.count : 0;
          
          return (
            <ActButton
              key={actBtn.id}
              id={actBtn.id}
              label={actBtn.label}
              color={actBtn.color}
              bgColor={actBtn.bgColor}
              isActive={activeAct === actBtn.id as ActType}
              count={count}
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
