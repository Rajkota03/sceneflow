
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Map, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';
import BeatPopoverContent from './BeatPopoverContent';

interface BeatPopoverProps {
  elementId: string;
  elementBeatId?: string;
}

const BeatPopover: React.FC<BeatPopoverProps> = ({ 
  elementId,
  elementBeatId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedStructure, handleBeatTag } = useScriptEditor();
  
  // Find the beat in the structure
  const findBeatDetails = () => {
    if (!selectedStructure || !elementBeatId) return null;
    
    for (const act of selectedStructure.acts) {
      const beat = act.beats.find(b => b.id === elementBeatId);
      if (beat) {
        return {
          beatTitle: beat.title,
          actId: act.id
        };
      }
    }
    return null;
  };
  
  const beatDetails = findBeatDetails();
  
  const handleBeatSelect = (beatId: string, actId: string) => {
    handleBeatTag(elementId, beatId);
    setIsOpen(false);
  };
  
  const handleRemoveBeat = () => {
    handleBeatTag(elementId, '');
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={elementBeatId ? "default" : "outline"} 
          size="sm" 
          className={cn(
            "h-6 px-2",
            elementBeatId 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'border-dashed border-gray-300 text-gray-500 hover:bg-gray-100'
          )}
        >
          {elementBeatId ? (
            <>
              <Check size={14} className="mr-1" />
              {beatDetails?.beatTitle || 'Beat'}
            </>
          ) : (
            <Map size={14} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[300px] max-h-[400px] overflow-hidden" 
        align="start"
        sideOffset={5}
      >
        {selectedStructure ? (
          <div className="flex flex-col">
            <div className="flex justify-between items-center p-2 bg-muted border-b">
              <span className="text-sm font-medium">Story Beat</span>
              {elementBeatId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemoveBeat}
                  className="h-7 w-7 p-0"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            <BeatPopoverContent 
              selectedStructure={selectedStructure}
              elementBeatId={elementBeatId}
              onBeatSelect={handleBeatSelect}
            />
          </div>
        ) : (
          <div className="p-3 text-sm text-center text-gray-500">
            Please select a structure to use beats.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default BeatPopover;
