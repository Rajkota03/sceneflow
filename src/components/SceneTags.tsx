
import React, { useState, useEffect } from 'react';
import { ScriptElement, ActType } from '@/lib/types';
import TagInput from './TagInput';
import { Tags } from 'lucide-react';
import SceneTagButton from './SceneTagButton';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
  selectedStructure?: any;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const SceneTags: React.FC<SceneTagsProps> = ({ 
  element, 
  onTagsChange,
  projectId,
  selectedStructure,
  onBeatTag
}) => {
  const [tags, setTags] = useState<string[]>(element.tags || []);
  
  useEffect(() => {
    setTags(element.tags || []);
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
  };

  const handleTagSelect = (tagType: string, actType?: ActType, beatId?: string) => {
    if (tagType === 'act' && actType) {
      // Remove any existing act tags first
      const filteredTags = tags.filter(tag => 
        !tag.startsWith('Act 1:') && 
        !tag.startsWith('Act 2A:') && 
        !tag.startsWith('Midpoint:') && 
        !tag.startsWith('Act 2B:') && 
        !tag.startsWith('Act 3:')
      );
      
      // Add the new act tag
      let newTag = '';
      switch (actType) {
        case ActType.ACT_1:
          newTag = 'Act 1: Setup';
          break;
        case ActType.ACT_2A:
          newTag = 'Act 2A: Reaction';
          break;
        case ActType.MIDPOINT:
          newTag = 'Midpoint: Turning Point';
          break;
        case ActType.ACT_2B:
          newTag = 'Act 2B: Approach';
          break;
        case ActType.ACT_3:
          newTag = 'Act 3: Resolution';
          break;
      }
      
      if (newTag) {
        const newTags = [...filteredTags, newTag];
        setTags(newTags);
        onTagsChange(element.id, newTags);
      }
    } 
    else if (tagType === 'beat' && beatId && actType && selectedStructure && onBeatTag) {
      // Find the beat in the selected structure
      let beatName = '';
      selectedStructure.acts?.forEach((act: any) => {
        if (act.act_type === actType) {
          act.beats?.forEach((beat: any) => {
            if (beat.id === beatId) {
              beatName = beat.title;
            }
          });
        }
      });
      
      if (beatName) {
        // Get the act ID based on act type
        const actId = selectedStructure.acts?.find((act: any) => act.act_type === actType)?.id || '';
        onBeatTag(element.id, beatId, actId);
      }
    }
    else if (tagType === 'custom') {
      // Custom tag handling will be done through TagInput
    }
  };

  if (element.type !== 'scene-heading') {
    return null;
  }

  return (
    <div className="my-1 ml-1">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-gray-500">
          <Tags size={14} className="mr-1" />
          <span className="text-xs font-medium">Scene Tags</span>
        </div>
        
        <SceneTagButton 
          onTagSelect={handleTagSelect}
          selectedStructure={selectedStructure}
          className="absolute right-2 top-0 opacity-70 hover:opacity-100"
        />
      </div>
      
      <TagInput
        tags={tags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    </div>
  );
};

export default SceneTags;
