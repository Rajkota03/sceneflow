
import React, { useState } from 'react';
import { ScriptElement, Structure, ActType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, X } from 'lucide-react';
import SceneTag from './SceneTag';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const getActTypeFromTitle = (title: string): ActType => {
  if (title.includes('Act 1')) return ActType.ACT_1;
  if (title.includes('Act 2A')) return ActType.ACT_2A;
  if (title.includes('Midpoint')) return ActType.MIDPOINT;
  if (title.includes('Act 2B')) return ActType.ACT_2B;
  if (title.includes('Act 3')) return ActType.ACT_3;
  return ActType.ACT_1; // Default
};

const SceneTags: React.FC<SceneTagsProps> = ({ 
  element, 
  onTagsChange,
  projectId,
  selectedStructure,
  onBeatTag
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [beatMenuOpen, setBeatMenuOpen] = useState(false);
  
  const handleAddTag = () => {
    if (newTag.trim() && !element.tags?.includes(newTag.trim())) {
      const updatedTags = [...(element.tags || []), newTag.trim()];
      onTagsChange(element.id, updatedTags);
    }
    setNewTag('');
    setIsAddingTag(false);
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    if (element.tags) {
      const updatedTags = element.tags.filter(tag => tag !== tagToRemove);
      onTagsChange(element.id, updatedTags);
    }
  };

  const handleBeatTagging = (beatId: string, actId: string, actType: ActType) => {
    if (onBeatTag) {
      onBeatTag(element.id, beatId, actId);
      setBeatMenuOpen(false);
    }
  };

  const hasBeats = selectedStructure && 
                 selectedStructure.acts && 
                 Array.isArray(selectedStructure.acts) && 
                 selectedStructure.acts.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1 mb-2 px-2">
      {element.tags?.map((tag, index) => (
        <SceneTag key={index} tag={tag} onRemove={() => handleRemoveTag(tag)} />
      ))}
      
      {isAddingTag ? (
        <div className="inline-flex items-center">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="px-2 py-0.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="Add tag..."
            autoFocus
          />
          <button 
            onClick={handleAddTag}
            className="ml-1 text-green-600 hover:text-green-800"
          >
            <Plus size={14} />
          </button>
          <button 
            onClick={() => setIsAddingTag(false)}
            className="ml-1 text-red-600 hover:text-red-800"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 py-0 text-xs"
          onClick={() => setIsAddingTag(true)}
        >
          <Plus size={14} className="mr-1" />
          Add Tag
        </Button>
      )}
      
      {onBeatTag && selectedStructure && (
        <Popover open={beatMenuOpen} onOpenChange={setBeatMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 py-0 text-xs ml-1"
            >
              <span>Beats</span>
              <ChevronDown size={14} className="ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2 max-h-80 overflow-auto">
            {!hasBeats && (
              <div className="text-sm text-gray-500 p-2">
                No beats available. Please select a structure first.
              </div>
            )}
            
            {hasBeats && selectedStructure.acts.map((act) => (
              <div key={act.id} className="mb-2">
                <div 
                  className="text-xs font-semibold pb-1 mb-1 border-b"
                  style={{ color: act.colorHex }}
                >
                  {act.title}
                </div>
                <div className="space-y-1">
                  {act.beats.map((beat) => {
                    const actType = getActTypeFromTitle(act.title);
                    const isSelected = element.beat === beat.id;
                    return (
                      <div
                        key={beat.id}
                        className={`text-xs py-1 px-2 rounded cursor-pointer flex items-center ${
                          isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleBeatTagging(beat.id, act.id, actType)}
                      >
                        <span>{beat.title}</span>
                        {isSelected && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-auto"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default SceneTags;
