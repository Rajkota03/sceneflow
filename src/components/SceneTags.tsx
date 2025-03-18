
import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plus, Tag, X } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './ui/popover';
import { Input } from './ui/input';
import { Structure } from '@/lib/types';
import { SceneTagsProps, TagInputProps } from '@/types/scriptTypes';

const TagInput: React.FC<TagInputProps> = ({ onTagSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onTagSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add tag"
        className="text-xs h-8"
      />
      <Button size="sm" type="submit" variant="secondary" className="h-8">
        Add
      </Button>
    </form>
  );
};

const SceneTags: React.FC<SceneTagsProps> = ({ 
  elementId, 
  tags = [], 
  onTagsChange,
  projectId,
  selectedStructure,
  onBeatTag
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange(elementId, updatedTags);
  };

  const handleAddTag = (newTag: string) => {
    if (!tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      onTagsChange(elementId, updatedTags);
    }
    setIsOpen(false);
  };

  const handleBeatSelection = (beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(elementId, beatId, actId);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center space-x-1">
      {tags.map(tag => (
        <Badge key={tag} variant="secondary" className="text-xs py-0 h-5">
          {tag}
          <button
            onClick={() => handleRemoveTag(tag)}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Add Tags to Scene</h3>
            <TagInput onTagSubmit={handleAddTag} />
            
            {selectedStructure && (
              <div className="mt-4">
                <h4 className="text-xs font-medium mb-2">Story Structure Beats</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedStructure.acts.map(act => (
                    <div key={act.id} className="space-y-1">
                      <div className="text-xs font-medium">{act.title}</div>
                      <div className="flex flex-wrap gap-1">
                        {act.beats.map(beat => (
                          <Badge
                            key={beat.id}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-gray-100"
                            onClick={() => handleBeatSelection(beat.id, act.id)}
                          >
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {beat.title.substring(0, 15)}
                            {beat.title.length > 15 ? '...' : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SceneTags;
