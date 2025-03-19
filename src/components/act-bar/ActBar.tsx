
import React from 'react';
import { ActType, Structure, BeatSceneCount } from '@/lib/types';
import StructureBar from './StructureBar';
import { cn } from '@/lib/utils';
import BeatsRow from './BeatsRow';

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
}

const ActBar: React.FC<ActBarProps> = ({ 
  activeAct, 
  onSelectAct, 
  selectedStructure,
  beatMode = 'on',
  activeBeatId,
  onBeatClick,
  beatSceneCounts = []
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
  
  // Create an array of StructureBarButtonProps objects
  const structureBarButtons = actButtons.map(act => ({
    ...act,
    isActive: activeAct === act.id as ActType,
    onClick: () => onSelectAct(act.id as ActType)
  }));
  
  return (
    <div className="w-full space-y-2">
      <StructureBar
        visibleActs={structureBarButtons}
        activeAct={activeAct}
        onSelectAct={onSelectAct}
        activeBeatId={activeBeatId}
        onBeatClick={onBeatClick}
      />
      
      {/* Show horizontal beats sections if beatMode is 'on' */}
      {beatMode === 'on' && (
        <div className="space-y-1 mt-1">
          {actButtons.map((act) => (
            <BeatsRow
              key={`beats-${act.id}`}
              actId={act.id}
              actLabel={act.label}
              actColor={act.color}
              actBgColor={act.bgColor}
              beats={act.beats || []}
              onBeatClick={onBeatClick}
              activeBeatId={activeBeatId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActBar;
