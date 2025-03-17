
import React, { useState, useEffect } from 'react';
import { ScriptElement, ActType, Structure } from '@/lib/types';
import TagInput from './TagInput';
import { Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import BeatSelector from './BeatSelector';
import SceneTagButton from './SceneTagButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);
  const [customTagValue, setCustomTagValue] = useState('');
  
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
        setSelectedAct(actType);
      }
    } 
    else if (tagType === 'beat' && beatId && actType && selectedStructure) {
      // Find the beat in the selected structure
      let beatName = '';
      selectedStructure.acts?.forEach(act => {
        if (act.act_type === actType) {
          act.beats?.forEach(beat => {
            if (beat.id === beatId) {
              beatName = beat.title;
            }
          });
        }
      });
      
      if (beatName && onBeatTag) {
        // Get the act ID based on act type
        const actId = selectedStructure.acts?.find(act => act.act_type === actType)?.id || '';
        onBeatTag(element.id, beatId, actId);
        
        // Also add a tag for this beat
        const newTag = `${getActPrefix(actType)}${beatName}`;
        if (!tags.includes(newTag)) {
          const newTags = [...tags, newTag];
          setTags(newTags);
          onTagsChange(element.id, newTags);
        }
      }
    }
    else if (tagType === 'custom') {
      setIsAddingCustomTag(true);
    }
  };

  const handleAddCustomTag = () => {
    if (customTagValue.trim()) {
      handleAddTag(customTagValue.trim());
      setCustomTagValue('');
      setIsAddingCustomTag(false);
    } else {
      setIsAddingCustomTag(false);
    }
  };

  const getActPrefix = (actType: ActType): string => {
    switch (actType) {
      case ActType.ACT_1: return 'Act 1: ';
      case ActType.ACT_2A: return 'Act 2A: ';
      case ActType.MIDPOINT: return 'Midpoint: ';
      case ActType.ACT_2B: return 'Act 2B: ';
      case ActType.ACT_3: return 'Act 3: ';
      default: return '';
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
      
      {isAddingCustomTag ? (
        <div className="flex items-center space-x-2 mb-2">
          <Input
            type="text"
            value={customTagValue}
            onChange={(e) => setCustomTagValue(e.target.value)}
            placeholder="Enter custom tag..."
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomTag();
              if (e.key === 'Escape') setIsAddingCustomTag(false);
            }}
            autoFocus
          />
          <Button 
            size="sm" 
            className="h-8 text-xs"
            onClick={handleAddCustomTag}
          >
            Add
          </Button>
        </div>
      ) : null}
      
      <TagInput
        tags={tags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    </div>
  );
};

export default SceneTags;
