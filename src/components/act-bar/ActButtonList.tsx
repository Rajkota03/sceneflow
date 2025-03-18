
import React from 'react';
import { ActType } from '@/lib/types';
import { Button } from '../ui/button';
import ActButton from './ActButton';
import { List } from 'lucide-react';
import { 
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

interface ActButtonListProps {
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  visibleActs: Array<{
    id: string;
    label: string;
    color: string;
    bgColor: string;
    beats?: Array<{id: string; title: string; description?: string; complete?: boolean;}>;
  }>;
  actCounts: Array<{
    act: ActType;
    count: number;
  }>;
  showAllActs: boolean;
  onToggleMoreActs: () => void;
  actButtons: Array<{
    id: string;
    label: string;
    color: string;
    bgColor: string;
    beats?: Array<{id: string; title: string; description?: string; complete?: boolean;}>;
  }>;
}

const ActButtonList: React.FC<ActButtonListProps> = ({
  activeAct,
  onSelectAct,
  visibleActs,
  actCounts,
  showAllActs,
  onToggleMoreActs,
  actButtons
}) => {
  return (
    <>
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
          onClick={onToggleMoreActs}
          className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400"
        >
          <List size={16} />
          <span className="ml-1">{showAllActs ? 'Less' : 'More'}</span>
        </Button>
      )}
    </>
  );
};

export default ActButtonList;
