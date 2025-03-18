
import React, { useState, useEffect } from 'react';
import { ScriptElement, Structure } from '@/lib/types';
import TagInput from './TagInput';
import { SceneTag } from './SceneTag';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tag, Plus, Flame } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(element.tags || []);
  const [beatMenuOpen, setBeatMenuOpen] = useState(false);
  
  useEffect(() => {
    setTags(element.tags || []);
  }, [element.tags]);
  
  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      onTagsChange(element.id, newTags);
      setInputValue('');
    }
  };
  
  const handleTagRemove = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    onTagsChange(element.id, newTags);
  };
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      handleTagAdd(inputValue.trim());
    }
  };
  
  // Check if we have a selected structure with acts
  const hasStructure = !!(selectedStructure && selectedStructure.acts && Array.isArray(selectedStructure.acts) && selectedStructure.acts.length > 0);
  
  // If we don't have a valid structure selected, show a message
  if (!hasStructure) {
    console.log("SceneTags - No structure selected");
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full text-gray-500"
            >
              <Tag size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>No structure selected. Select a structure to tag beats.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  console.log("SceneTags - Selected structure:", selectedStructure?.name);
  console.log("SceneTags - Structure acts:", selectedStructure?.acts?.length || 0);
  
  // Get all available beats from the structure
  const availableBeats = selectedStructure?.acts?.flatMap(act => 
    act.beats?.map(beat => ({
      beatId: beat.id,
      actId: act.id,
      beatTitle: beat.title,
      actTitle: act.title
    })) || []
  ) || [];
  
  // Check if this scene has a beat tag
  const hasBeatTag = !!element.beat;
  
  // Find the beat details if this scene has a beat tag
  const beatDetails = hasBeatTag 
    ? availableBeats.find(b => b.beatId === element.beat)
    : null;
  
  const handleBeatSelect = (beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(element.id, beatId, actId);
    }
    setBeatMenuOpen(false);
  };

  return (
    <div className="flex items-center text-xs space-x-1">
      {tags.map(tag => (
        <SceneTag 
          key={tag} 
          tag={tag} 
          onRemove={() => handleTagRemove(tag)} 
        />
      ))}
      
      <div className="flex items-center space-x-1">
        {/* Beat selector dropdown */}
        <DropdownMenu open={beatMenuOpen} onOpenChange={setBeatMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={hasBeatTag ? "default" : "outline"} 
              size="sm" 
              className={`h-6 px-2 ${
                hasBeatTag 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'border-dashed border-gray-300 text-gray-500'
              }`}
            >
              <Flame size={14} className={hasBeatTag ? 'mr-1' : ''} />
              {beatDetails ? beatDetails.beatTitle : ''}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-auto">
            {selectedStructure?.acts?.map(act => (
              <React.Fragment key={act.id}>
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                  {act.title || "Act"}
                </div>
                {act.beats?.map(beat => (
                  <DropdownMenuItem 
                    key={beat.id}
                    onClick={() => handleBeatSelect(beat.id, act.id)}
                    className={`text-xs cursor-pointer ${element.beat === beat.id ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' : ''}`}
                  >
                    {beat.title}
                    {element.beat === beat.id && (
                      <Flame size={14} className="ml-auto text-orange-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Tag manager popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full text-gray-500"
            >
              <Plus size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <TagInput
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onTagAdd={handleTagAdd}
              placeholder="Add tags..."
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default SceneTags;
