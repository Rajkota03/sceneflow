
import React, { useState } from 'react';
import { ScriptElement, Structure } from '@/lib/types';
import { Tag } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from './ui/button';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const SceneTags: React.FC<SceneTagsProps> = ({
  element,
  onTagsChange,
  projectId,
  selectedStructure,
  onBeatTag
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagClick = (beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(element.id, beatId, actId);
      setIsOpen(false);
    }
  };

  if (!selectedStructure || !selectedStructure.acts || !Array.isArray(selectedStructure.acts) || selectedStructure.acts.length === 0) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Tag className="h-4 w-4 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-2">
          <div className="text-xs text-gray-500 p-2">
            No structure selected or structure has no acts/beats.
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-50 hover:opacity-100 transition-opacity">
          <Tag className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="end">
        <div className="p-2 max-h-[300px] overflow-y-auto">
          <h3 className="font-semibold text-sm mb-2">{selectedStructure.name} Beats</h3>
          <div className="space-y-2">
            {selectedStructure.acts.map((act) => (
              <div key={act.id} className="space-y-1">
                <h4 className="text-xs font-medium text-gray-600">{act.title || act.id}</h4>
                <div className="grid grid-cols-1 gap-1">
                  {Array.isArray(act.beats) && act.beats.map((beat) => (
                    <button
                      key={beat.id}
                      onClick={() => handleTagClick(beat.id, act.id)}
                      className="text-xs py-1 px-2 text-left hover:bg-gray-100 rounded transition-colors w-full truncate"
                    >
                      {beat.title || beat.id}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SceneTags;
