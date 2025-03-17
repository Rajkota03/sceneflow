
import React, { useState, useEffect } from 'react';
import { Structure, Beat, Act, ActType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';

interface BeatTaggingProps {
  selectedStructure: Structure | null;
  elementId: string;
  onBeatTag: (elementId: string, beatId: string, actId: string) => void;
  selectedBeatId?: string;
}

const BeatTagging: React.FC<BeatTaggingProps> = ({
  selectedStructure,
  elementId,
  onBeatTag,
  selectedBeatId
}) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!selectedStructure) {
    return null;
  }
  
  const handleBeatSelect = (beatId: string, actId: string, actType: ActType) => {
    onBeatTag(elementId, beatId, actId);
    setExpanded(false);
    
    toast({
      title: "Beat tagged",
      description: "This scene has been tagged with the selected beat.",
    });
  };
  
  // Find the currently selected beat and its act
  let selectedBeatTitle = "";
  let selectedActTitle = "";
  
  if (selectedBeatId) {
    for (const act of selectedStructure.acts) {
      const beat = act.beats.find(b => b.id === selectedBeatId);
      if (beat) {
        selectedBeatTitle = beat.title;
        selectedActTitle = act.title;
        break;
      }
    }
  }

  // Get the ActType based on act title
  const getActType = (actTitle: string): ActType => {
    if (actTitle.includes('Act 1')) return ActType.ACT_1;
    if (actTitle.includes('Act 2A')) return ActType.ACT_2A;
    if (actTitle.includes('Midpoint')) return ActType.MIDPOINT;
    if (actTitle.includes('Act 2B')) return ActType.ACT_2B;
    if (actTitle.includes('Act 3')) return ActType.ACT_3;
    return ActType.ACT_1; // Default
  };

  return (
    <div className="mt-2 mb-3">
      <div className="flex items-center text-gray-500 mb-1">
        <Target size={14} className="mr-1" />
        <span className="text-xs font-medium">Story Beat</span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between text-xs h-8"
        onClick={() => setExpanded(!expanded)}
      >
        <span>
          {selectedBeatTitle 
            ? `${selectedActTitle}: ${selectedBeatTitle}` 
            : "Tag with a story beat"}
        </span>
        {expanded ? 
          <ChevronUp size={14} /> : 
          <ChevronDown size={14} />
        }
      </Button>
      
      {expanded && (
        <div className="border rounded-md mt-1 bg-white shadow-sm">
          <ScrollArea className="max-h-48" hideScrollbar={true}>
            {selectedStructure.acts.map((act) => (
              <div key={act.id} className="p-2">
                <div 
                  className="text-xs font-semibold pb-1 mb-1 border-b"
                  style={{ color: act.colorHex }}
                >
                  {act.title}
                </div>
                <div className="space-y-1">
                  {act.beats.map((beat) => {
                    const actType = getActType(act.title);
                    return (
                      <Button
                        key={beat.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-7"
                        onClick={() => handleBeatSelect(beat.id, act.id, actType)}
                      >
                        <div className="flex items-center w-full">
                          <span>{beat.title}</span>
                          {selectedBeatId === beat.id && (
                            <Check size={12} className="ml-auto text-green-500" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default BeatTagging;
