
import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScriptElement, Structure } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Command } from '@/components/ui/command';
import { Check, ChevronDown, Pencil, Plus, Tag } from 'lucide-react';
import TagInput from './TagInput';
import SceneTag from './SceneTag';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
  const [searchValue, setSearchValue] = useState('');
  const [selectedBeats, setSelectedBeats] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(element.tags || []);
  
  useEffect(() => {
    setTags(element.tags || []);
  }, [element.tags]);
  
  const handleTagBeats = (beatId: string, actId: string, beatTitle: string, actTitle: string) => {
    if (!selectedStructure) {
      toast({
        title: "No structure selected",
        description: "Please select a story structure first",
        variant: "destructive",
      });
      return;
    }
    
    // Create the tag with format: "Act X: Beat Name"
    const tagText = `${actTitle}: ${beatTitle}`;
    
    // Check if tag already exists
    if (tags.includes(tagText)) {
      toast({
        title: "Beat already tagged",
        description: `This scene is already tagged with "${tagText}"`,
        variant: "destructive",
      });
      return;
    }
    
    // Add new tag
    const newTags = [...tags, tagText];
    setTags(newTags);
    onTagsChange(element.id, newTags);
    
    // Call the onBeatTag handler if provided
    if (onBeatTag) {
      onBeatTag(element.id, beatId, actId);
    }
    
    setIsOpen(false);
  };
  
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      onTagsChange(element.id, newTags);
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    onTagsChange(element.id, newTags);
  };
  
  // Function to safely get the acts array or return an empty array
  const getStructureActs = () => {
    try {
      if (!selectedStructure) return [];
      return selectedStructure.acts || [];
    } catch (error) {
      console.error("Error accessing structure acts:", error);
      return [];
    }
  };
  
  const structureActs = getStructureActs();

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, index) => (
        <SceneTag 
          key={`${tag}-${index}`} 
          tag={tag} 
          onRemove={() => handleRemoveTag(tag)} 
        />
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-6 px-2 rounded-full text-xs bg-white" 
            onClick={() => setIsOpen(true)}
          >
            <Plus size={12} className="mr-1" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-72" align="end">
          <Command>
            <CommandInput 
              placeholder="Search beats or type a custom tag" 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No results found.</CommandEmpty>
              
              {/* Story Structure Beats */}
              {selectedStructure && Array.isArray(structureActs) && structureActs.length > 0 ? (
                <div className="border-b border-gray-200 pb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500">
                    Story Beats from {selectedStructure.name}
                  </div>
                  
                  {structureActs.map(act => (
                    <CommandGroup key={act.id} heading={act.title}>
                      {Array.isArray(act.beats) && act.beats.map(beat => (
                        <CommandItem 
                          key={beat.id}
                          onSelect={() => handleTagBeats(beat.id, act.id, beat.title, act.title)}
                          className="cursor-pointer"
                        >
                          <span>{beat.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No story structure selected.</p>
                  <p className="mt-1 text-xs">
                    Select a story structure from the dropdown above to tag scenes with beats.
                  </p>
                </div>
              )}
              
              {/* Custom Tag Input */}
              <div className="p-3 border-t border-gray-200">
                <TagInput 
                  value={searchValue} 
                  onChange={setSearchValue} 
                  onSubmit={(tag) => {
                    handleAddTag(tag);
                    setSearchValue('');
                    setIsOpen(false);
                  }}
                />
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SceneTags;
