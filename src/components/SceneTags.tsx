
import React, { useState, useEffect } from 'react';
import { ScriptElement, ActType, Structure } from '@/lib/types';
import TagInput from './TagInput';
import { Tags } from 'lucide-react';
import BeatTagging from './BeatTagging';

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

  const handleBeatTagging = (elementId: string, beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(elementId, beatId, actId);
      
      // Find the beat title and act name for the tag
      if (selectedStructure) {
        const act = selectedStructure.acts.find(a => a.id === actId);
        if (act) {
          const beat = act.beats.find(b => b.id === beatId);
          if (beat) {
            // Create a tag in format "Act X: Beat Name"
            let tagPrefix = '';
            const actType = getActTypeFromTitle(act.title);
            switch(actType) {
              case ActType.ACT_1: tagPrefix = 'Act 1: '; break;
              case ActType.ACT_2A: tagPrefix = 'Act 2A: '; break;
              case ActType.MIDPOINT: tagPrefix = 'Midpoint: '; break;
              case ActType.ACT_2B: tagPrefix = 'Act 2B: '; break;
              case ActType.ACT_3: tagPrefix = 'Act 3: '; break;
            }
            
            // Remove any existing act tags
            const filteredTags = tags.filter(tag => 
              !tag.startsWith('Act 1:') && 
              !tag.startsWith('Act 2A:') && 
              !tag.startsWith('Midpoint:') && 
              !tag.startsWith('Act 2B:') && 
              !tag.startsWith('Act 3:')
            );
            
            const newTag = `${tagPrefix}${beat.title}`;
            const newTags = [...filteredTags, newTag];
            
            setTags(newTags);
            onTagsChange(element.id, newTags);
          }
        }
      }
    }
  };
  
  const getActTypeFromTitle = (title: string): ActType => {
    if (title.includes('Act 1')) return ActType.ACT_1;
    if (title.includes('Act 2A')) return ActType.ACT_2A;
    if (title.includes('Midpoint')) return ActType.MIDPOINT;
    if (title.includes('Act 2B')) return ActType.ACT_2B;
    if (title.includes('Act 3')) return ActType.ACT_3;
    return ActType.ACT_1; // Default
  };

  if (element.type !== 'scene-heading') {
    return null;
  }

  return (
    <div className="my-1 ml-1">
      <div className="flex items-center text-gray-500 mb-1">
        <Tags size={14} className="mr-1" />
        <span className="text-xs font-medium">Scene Tags</span>
      </div>
      
      {/* Simple beat tagging (moved to the top) */}
      {selectedStructure && onBeatTag && (
        <BeatTagging
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
