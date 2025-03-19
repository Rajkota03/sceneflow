
import React, { useState, useEffect } from 'react';
import { ScriptElement, Structure, Beat } from '@/lib/types';
import TagInput from './TagInput';
import SceneTag from './SceneTag';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tag, Plus, Flame, Map } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

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
  const [beatPopupOpen, setBeatPopupOpen] = useState(false);
  
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
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full text-gray-500"
            >
              <Map size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>No story structure selected. Select a structure to tag beats.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Get all available beats from the structure
  const availableBeats = selectedStructure?.acts?.flatMap(act => 
    act.beats?.map(beat => ({
      beatId: beat.id,
      actId: act.id,
      beatTitle: beat.title,
      actTitle: act.title,
      pageRange: beat.pageRange || '',
      complete: beat.complete || false
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
      // Close the popup immediately after selection
      setBeatPopupOpen(false);
    }
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
        {/* Click-to-tag beat selector popup */}
        <Popover open={beatPopupOpen} onOpenChange={setBeatPopupOpen}>
          <PopoverTrigger asChild>
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
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 max-h-80 overflow-auto p-0">
            <div className="py-1 text-sm font-medium px-2 bg-muted">
              Select Beat
            </div>
            
            {selectedStructure?.acts?.map(act => (
              <React.Fragment key={act.id}>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
                  {act.title || "Act"}
                </div>
                <div className="p-1">
                  {act.beats?.map(beat => {
                    const isSelected = element.beat === beat.id;
                    const sceneCount = 0; // Will be implemented with scene counting
                    
                    return (
                      <button 
                        key={beat.id}
                        onClick={() => handleBeatSelect(beat.id, act.id)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 text-xs rounded",
                          isSelected 
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{beat.title}</span>
                          {sceneCount > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({sceneCount} Scene{sceneCount !== 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex items-center mt-0.5 text-xs text-orange-600 dark:text-orange-400">
                            <Flame size={10} className="mr-1" />
                            <span>Tagged</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </PopoverContent>
        </Popover>
        
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
            <div className="text-xs font-medium mb-1 text-gray-500">Add Tag</div>
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Add tags..."
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button 
                size="sm" 
                className="ml-2 h-8" 
                onClick={() => handleTagAdd(inputValue.trim())}
              >
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default SceneTags;
