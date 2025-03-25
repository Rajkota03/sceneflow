
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, CircleDashed } from 'lucide-react';
import BeatPopover from './BeatPopover';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';

interface BeatTagButtonProps {
  elementId: string;
  beatId?: string;
  beatTitle?: string;
}

const BeatTagButton: React.FC<BeatTagButtonProps> = ({
  elementId,
  beatId,
  beatTitle
}) => {
  const { selectedStructure } = useScriptEditor();
  
  // Find the beat in the structure to get its details
  const findBeatDetails = () => {
    if (!beatId || !selectedStructure) return null;
    
    for (const act of selectedStructure.acts) {
      const beat = act.beats.find(b => b.id === beatId);
      if (beat) {
        return {
          title: beat.title,
          actTitle: act.title,
          actColor: act.colorHex
        };
      }
    }
    return null;
  };
  
  const beatDetails = findBeatDetails();
  
  return (
    <div className="inline-flex items-center">
      {beatId && beatDetails ? (
        <Badge 
          variant="outline"
          className="flex items-center gap-1 text-xs py-0.5 border-dashed hover:bg-slate-100"
          style={{ borderColor: beatDetails.actColor, color: beatDetails.actColor }}
        >
          <Tag size={12} />
          <span>{beatDetails.title}</span>
        </Badge>
      ) : (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 text-xs py-0.5 text-gray-400 border-dashed hover:bg-slate-100"
        >
          <CircleDashed size={12} />
          <span>Tag Beat</span>
        </Badge>
      )}
      
      <BeatPopover 
        elementId={elementId}
        elementBeatId={beatId}
      />
    </div>
  );
};

export default BeatTagButton;
