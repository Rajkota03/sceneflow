
import React from 'react';
import { ActType, Structure, BeatSceneCount } from '@/lib/types';
import StructureBar from './StructureBar';
import { cn } from '@/lib/utils';
import HorizontalBeatsBar from './HorizontalBeatsBar';

interface ActCount {
  act: ActType;
  count: number;
}

interface ActBarProps {
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  projectName?: string;
  structureName?: string;
  selectedStructure?: Structure | null;
  beatMode?: 'on' | 'off';
  activeBeatId?: string | null;
  onBeatClick?: (beatId: string) => void;
  beatSceneCounts?: BeatSceneCount[];
  actCounts?: ActCount[]; // Added this property
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct, 
  selectedStructure,
  beatMode = 'on',
  activeBeatId,
  onBeatClick,
  beatSceneCounts = [],
  actCounts = [] // Add default value
}) => {
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
    console.log('ActBar: Structure changed', selectedStructure?.id, selectedStructure?.name);
    
    if (selectedStructure?.acts && Array.isArray(selectedStructure.acts) && selectedStructure.acts.length > 0) {
      console.log('ActBar: Structure has acts', selectedStructure.acts.length);
      
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
      console.log('ActBar: Using default act buttons');
      setActButtons(defaultActColors);
    }
  }, [selectedStructure, beatSceneCounts]);
  
  // Create an array of StructureBarButtonProps objects
  const structureBarButtons = actButtons.map(act => ({
    ...act,
    isActive: activeAct === act.id as ActType,
    onClick: () => onSelectAct(act.id as ActType)
  }));
  
  // Combine all beats into a single array for the horizontal beats bar
  const allBeats = React.useMemo(() => {
    const beats: Array<{
      id: string;
      title: string;
      description?: string;
      complete?: boolean;
      sceneCount?: number;
      pageRange?: string;
      actId: string;
      actColor: string;
      actBgColor: string;
    }> = [];
    
    actButtons.forEach(act => {
      if (act.beats && act.beats.length > 0) {
        act.beats.forEach(beat => {
          beats.push({
            ...beat,
            actId: act.id,
            actColor: act.color,
            actBgColor: act.bgColor
          });
        });
      }
    });
    
    return beats;
  }, [actButtons]);
  
  return (
    <div className="w-full space-y-2">
      <StructureBar
        visibleActs={structureBarButtons}
        activeAct={activeAct}
        onSelectAct={onSelectAct}
        activeBeatId={activeBeatId}
        onBeatClick={onBeatClick}
      />
      
      {/* Show single horizontal beats bar if beatMode is 'on' */}
      {beatMode === 'on' && allBeats.length > 0 && (
        <div className="border rounded-md p-2 bg-white dark:bg-gray-800">
          <HorizontalBeatsBar
            actId="all"
            actColor=""
            actBgColor=""
            beats={allBeats}
            onBeatClick={onBeatClick}
            activeBeatId={activeBeatId}
          />
        </div>
      )}
    </div>
  );
};

export default ActBar;
