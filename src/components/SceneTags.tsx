
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Trash } from 'lucide-react';
import TagInput from './TagInput';
import { Structure } from '@/lib/types';

interface SceneTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  elementType: string;
  elementId: string;
  projectId?: string;
  beatMode?: 'on' | 'off';
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const SceneTags: React.FC<SceneTagsProps> = ({
  tags = [],
  onChange,
  elementType,
  elementId,
  projectId,
  beatMode = 'on',
  selectedStructure = null,
  onBeatTag
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showBeatPopover, setShowBeatPopover] = useState(false);

  // Early return if we shouldn't show tags
  if (beatMode === 'off') return null;
  
  // Only show tags on scene headings
  if (elementType !== 'scene-heading') return null;

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      onChange(newTags);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleTagBeat = (beatId: string, actId: string, beatTitle: string, actTitle: string) => {
    if (onBeatTag) {
      onBeatTag(elementId, beatId, actId);
      
      // Also add the beat as a tag
      const beatTag = `${actTitle}: ${beatTitle}`;
      if (!tags.includes(beatTag)) {
        handleAddTag(beatTag);
      }
    }
    
    setShowBeatPopover(false);
  };

  // Safe check if selectedStructure and selectedStructure.acts exists and is an array
  const hasValidStructure = 
    selectedStructure && 
    selectedStructure.acts && 
    Array.isArray(selectedStructure.acts) && 
    selectedStructure.acts.length > 0;

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {tags.map(tag => (
        <Badge 
          key={tag} 
          variant="secondary" 
          className="flex items-center gap-1 px-2 text-xs"
        >
          {tag}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleRemoveTag(tag)}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs border-dashed border-gray-400"
          >
            + Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search or enter custom tag..." 
              value={inputValue}
              onValueChange={setInputValue}
            />
            
            <CommandList>
              <CommandEmpty>
                <div className="py-2 px-4">
                  <p className="text-sm text-gray-500">Create a custom tag</p>
                  <TagInput 
                    onSubmit={handleAddTag}
                  />
                </div>
              </CommandEmpty>
              
              <CommandGroup heading="Common Tags">
                <CommandItem onSelect={() => handleAddTag('Important')} className="cursor-pointer">
                  <span>Important</span>
                </CommandItem>
                <CommandItem onSelect={() => handleAddTag('Revision Needed')} className="cursor-pointer">
                  <span>Revision Needed</span>
                </CommandItem>
                <CommandItem onSelect={() => handleAddTag('Hero Moment')} className="cursor-pointer">
                  <span>Hero Moment</span>
                </CommandItem>
                <CommandItem onSelect={() => handleAddTag('Turning Point')} className="cursor-pointer">
                  <span>Turning Point</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {beatMode === 'on' && onBeatTag && hasValidStructure && (
        <Popover open={showBeatPopover} onOpenChange={setShowBeatPopover}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-xs border-dashed border-gray-400 bg-blue-50"
            >
              + Add Beat
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search beats..." />
              
              <ScrollArea className="h-[300px]">
                <CommandList>
                  <CommandEmpty>No beats found.</CommandEmpty>
                  
                  {hasValidStructure && selectedStructure.acts.map((act) => (
                    <CommandGroup key={act.id} heading={act.title}>
                      {act.beats.map((beat) => (
                        <CommandItem 
                          key={beat.id} 
                          onSelect={() => handleTagBeat(beat.id, act.id, beat.title, act.title)}
                          className="cursor-pointer"
                        >
                          <span>{beat.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default SceneTags;
