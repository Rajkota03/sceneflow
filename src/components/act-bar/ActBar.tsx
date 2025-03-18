
import React from 'react';
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
import BeatSection from './BeatSection';
import StructureHeader from './StructureHeader';
import ActButtonList from './ActButtonList';
import { cn } from '@/lib/utils';

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
  beatMode?: 'on' | 'off';
  activeBeatId?: string | null;
  onBeatClick?: (beatId: string) => void;
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct, 
  actCounts,
  projectName,
  structureName,
  selectedStructure,
  beatMode = 'on',
  activeBeatId,
  onBeatClick
}) => {
  const [showAllActs, setShowAllActs] = React.useState(false);
  const [actButtons, setActButtons] = React.useState<Array<{
    id: string;
    label: string;
    color: string;
    bgColor: string;
    beats?: Array<{id: string; title: string; description?: string; complete?: boolean;}>;
  }>>([]);
  
  // Default structure colors
  const defaultActColors = [
    { id: 'act1', label: 'Act 1', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    { id: 'act2a', label: 'Act 2A', color: 'text-amber-800', bgColor: 'bg-amber-200' },
    { id: 'midpoint', label: 'Midpoint', color: 'text-pink-800', bgColor: 'bg-pink-200' },
    { id: 'act2b', label: 'Act 2B', color: 'text-orange-800', bgColor: 'bg-orange-200' },
    { id: 'act3', label: 'Act 3', color: 'text-green-800', bgColor: 'bg-green-100' }
  ];
  
  React.useEffect(() => {
    if (selectedStructure?.acts && Array.isArray(selectedStructure.acts) && selectedStructure.acts.length > 0) {
      const buttons = selectedStructure.acts.map((act, index) => {
        const defaultColor = defaultActColors[index] || defaultActColors[0];
        return {
          id: act.id,
          label: act.title || `Act ${index + 1}`,
          color: defaultColor.color,
          bgColor: defaultColor.bgColor,
          beats: act.beats ? [...act.beats] : []
        };
      });
      
      setActButtons(buttons);
    } else {
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
  
  const handleToggleMoreActs = () => {
    setShowAllActs(!showAllActs);
  };
  
  return (
    <div className="w-full space-y-3">
      <StructureBar
        visibleActs={structureBarButtons}
        activeAct={activeAct}
        onSelectAct={onSelectAct}
        className="mb-1"
      />
      
      {/* Show beats sections if beatMode is 'on' */}
      {beatMode === 'on' && (
        <div className="space-y-0.5">
          {visibleActs.map((act) => (
            <React.Fragment key={`beats-${act.id}`}>
              {activeAct === act.id as ActType && (
                <BeatSection
                  actId={act.id}
                  actColor={act.color}
                  actBgColor={act.bgColor}
                  beats={act.beats || []}
                  onBeatClick={onBeatClick}
                  activeBeatId={activeBeatId}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      
      {/* Button filters for quick navigation */}
      <div className={cn(
        "flex flex-wrap items-center gap-2",
        beatMode === 'on' ? "mt-3" : "mt-2"
      )}>
        <ActButtonList 
          activeAct={activeAct}
          onSelectAct={onSelectAct}
          visibleActs={visibleActs}
          actCounts={actCounts}
          showAllActs={showAllActs}
          onToggleMoreActs={handleToggleMoreActs}
          actButtons={actButtons}
        />
      </div>
    </div>
  );
};

export default ActBar;
