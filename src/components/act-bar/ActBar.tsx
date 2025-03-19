
import React from 'react';
import { ActType, Structure, BeatSceneCount } from '@/lib/types';
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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  beatSceneCounts?: BeatSceneCount[];
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
  onBeatClick,
  beatSceneCounts = []
}) => {
  const [showAllActs, setShowAllActs] = React.useState(false);
  const [actButtons, setActButtons] = React.useState<Array<{
    id: string;
    label: string;
    color: string;
    bgColor: string;
    beats?: Array<{
      id: string; 
      title: string; 
      description?: string; 
      complete?: boolean;
      sceneCount?: number;
      pageRange?: string;
    }>;
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
        
        // Add scene counts to beats
        const beatsWithCounts = act.beats ? act.beats.map(beat => {
          const countInfo = beatSceneCounts.find(c => c.beatId === beat.id);
          return {
            ...beat,
            sceneCount: countInfo?.count || 0,
            pageRange: countInfo?.pageRange || ''
          };
        }) : [];
        
        return {
          id: act.id,
          label: act.title || `Act ${index + 1}`,
          color: defaultColor.color,
          bgColor: defaultColor.bgColor,
          beats: beatsWithCounts
        };
      });
      
      setActButtons(buttons);
    } else {
      setActButtons(defaultActColors);
    }
  }, [selectedStructure, beatSceneCounts]);
  
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
        <Accordion type="multiple" className="w-full space-y-2">
          {visibleActs.map((act) => (
            <AccordionItem 
              key={`beats-${act.id}`} 
              value={act.id}
              className={cn(
                "border rounded-md overflow-hidden",
                act.bgColor.replace('bg-', 'border-').replace('100', '200').replace('200', '300')
              )}
            >
              <AccordionTrigger className={cn(
                "px-3 py-2 text-sm font-medium", 
                act.bgColor, 
                act.color
              )}>
                {act.label} Beats
                {act.beats && act.beats.length > 0 && (
                  <span className="text-xs font-normal ml-2 opacity-70">
                    ({act.beats.length})
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2">
                {act.beats && act.beats.length > 0 ? (
                  <BeatSection
                    actId={act.id}
                    actColor={act.color}
                    actBgColor={act.bgColor}
                    beats={act.beats}
                    onBeatClick={onBeatClick}
                    activeBeatId={activeBeatId}
                  />
                ) : (
                  <div className="text-sm text-gray-500">No beats defined for this act</div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
