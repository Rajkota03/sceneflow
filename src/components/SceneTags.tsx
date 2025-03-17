
import React, { useState, useEffect } from 'react';
import { ScriptElement, ActType, Structure } from '@/lib/types';
import TagInput from './TagInput';
import { Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import BeatSelector from './BeatSelector';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
  structures?: Structure[];
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const SceneTags: React.FC<SceneTagsProps> = ({ 
  element, 
  onTagsChange, 
  projectId,
  structures = [],
  selectedStructure,
  onBeatTag 
}) => {
  const [tags, setTags] = useState<string[]>(element.tags || []);
  const [selectedAct, setSelectedAct] = useState<ActType | null>(null);
  
  useEffect(() => {
    setTags(element.tags || []);
    
    // Determine which act is selected based on tags
    let act: ActType | null = null;
    (element.tags || []).forEach(tag => {
      if (tag.startsWith('Act 1:')) act = ActType.ACT_1;
      else if (tag.startsWith('Act 2A:')) act = ActType.ACT_2A;
      else if (tag.startsWith('Midpoint:')) act = ActType.MIDPOINT;
      else if (tag.startsWith('Act 2B:')) act = ActType.ACT_2B;
      else if (tag.startsWith('Act 3:')) act = ActType.ACT_3;
    });
    setSelectedAct(act);
  }, [element.tags]);

  const handleAddTag = (tag: string) => {
    const newTags = [...tags, tag];
    setTags(newTags);
    onTagsChange(element.id, newTags);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onTagsChange(element.id, newTags);
    
    // Update selectedAct if an act tag was removed
    if (tagToRemove.startsWith('Act 1:') || 
        tagToRemove.startsWith('Act 2A:') || 
        tagToRemove.startsWith('Midpoint:') || 
        tagToRemove.startsWith('Act 2B:') || 
        tagToRemove.startsWith('Act 3:')) {
      setSelectedAct(null);
    }
  };

  const handleBeatTagging = (elementId: string, beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(elementId, beatId, actId);
    }
  };

  if (element.type !== 'scene-heading') {
    return null;
  }

  // Check if selectedStructure is valid and has acts property as an array
  const isValidStructure = selectedStructure && 
                           selectedStructure.acts && 
                           Array.isArray(selectedStructure.acts) && 
                           selectedStructure.acts.length > 0;

  return (
    <div className="my-1 ml-1">
      <div className="flex items-center text-gray-500 mb-1">
        <Tags size={14} className="mr-1" />
        <span className="text-xs font-medium">Scene Tags</span>
      </div>
      
      {/* Use BeatSelector component only when structure is valid */}
      {isValidStructure && onBeatTag && (
        <BeatSelector
          selectedStructure={selectedStructure}
          elementId={element.id}
          onBeatTag={handleBeatTagging}
          selectedBeatId={element.beat}
        />
      )}
      
      <TagInput
        tags={tags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    </div>
  );
};

export default SceneTags;
