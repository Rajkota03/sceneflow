
import React, { useState, useEffect } from 'react';
import { ScriptElement, ActType, StoryBeat } from '@/lib/types';
import TagInput from './TagInput';
import { Tags } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
}

const SceneTags: React.FC<SceneTagsProps> = ({ element, onTagsChange, projectId }) => {
  const [tags, setTags] = useState<string[]>(element.tags || []);
  const [selectedAct, setSelectedAct] = useState<ActType | null>(null);
  
  useEffect(() => {
    setTags(element.tags || []);
    
    // Determine which act is selected based on tags
    let act: ActType | null = null;
    (element.tags || []).forEach(tag => {
      if (tag.startsWith('Act 1:')) act = 1;
      else if (tag.startsWith('Act 2A:')) act = '2A';
      else if (tag.startsWith('Midpoint:')) act = 'midpoint';
      else if (tag.startsWith('Act 2B:')) act = '2B';
      else if (tag.startsWith('Act 3:')) act = 3;
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

  const handleActSelection = (act: ActType, beatName: string) => {
    // Remove any existing act tags
    const filteredTags = tags.filter(tag => 
      !tag.startsWith('Act 1:') && 
      !tag.startsWith('Act 2A:') && 
      !tag.startsWith('Midpoint:') && 
      !tag.startsWith('Act 2B:') && 
      !tag.startsWith('Act 3:')
    );
    
    // Add the new act tag
    let prefix = '';
    switch(act) {
      case 1: prefix = 'Act 1: '; break;
      case '2A': prefix = 'Act 2A: '; break;
      case 'midpoint': prefix = 'Midpoint: '; break;
      case '2B': prefix = 'Act 2B: '; break;
      case 3: prefix = 'Act 3: '; break;
    }
    
    const newTag = `${prefix}${beatName}`;
    const newTags = [...filteredTags, newTag];
    
    setTags(newTags);
    setSelectedAct(act);
    onTagsChange(element.id, newTags);
  };

  if (element.type !== 'scene-heading') {
    return null;
  }

  const getActColor = (act: ActType): string => {
    switch (act) {
      case 1: return 'bg-[#D3E4FD] border-[#4A90E2] text-[#2171D2]';
      case '2A': return 'bg-[#FEF7CD] border-[#F5A623] text-[#D28A21]';
      case 'midpoint': return 'bg-[#FFCCCB] border-[#FF9E9D] text-[#D24E4D]';
      case '2B': return 'bg-[#FDE1D3] border-[#F57C00] text-[#D26600]';
      case 3: return 'bg-[#F2FCE2] border-[#009688] text-[#007F73]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActLabel = (act: ActType): string => {
    switch (act) {
      case 1: return 'Act 1';
      case '2A': return 'Act 2A';
      case 'midpoint': return 'Midpoint';
      case '2B': return 'Act 2B';
      case 3: return 'Act 3';
      default: return '';
    }
  };

  const getActBeats = (act: ActType): string[] => {
    switch (act) {
      case 1:
        return ['Hook', 'Setup', 'Inciting Incident', 'First Plot Point'];
      case '2A':
        return ['First Pinch Point', 'Rising Action'];
      case 'midpoint':
        return ['Revelation', 'Shift', 'Game Changer'];
      case '2B':
        return ['Second Pinch Point', 'Rising Complications'];
      case 3:
        return ['Crisis', 'Climax', 'Resolution'];
      default:
        return [];
    }
  };

  return (
    <div className="my-1 ml-1">
      <div className="flex items-center text-gray-500 mb-1">
        <Tags size={14} className="mr-1" />
        <span className="text-xs font-medium">Scene Tags</span>
      </div>
      
      <div className="mb-2">
        <div className="text-xs font-medium mb-1 text-gray-500">Story Beat</div>
        <div className="grid grid-cols-5 gap-1 mb-2">
          {([1, '2A', 'midpoint', '2B', 3] as ActType[]).map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAct(selectedAct === act ? null : act)}
              className={cn(
                'text-xs py-1 rounded border',
                selectedAct === act ? getActColor(act) : 'bg-gray-100 text-gray-600'
              )}
            >
              {getActLabel(act)}
            </button>
          ))}
        </div>
        
        {selectedAct && (
          <div className="mb-2">
            <div className="text-xs font-medium mb-1 text-gray-500">
              Select Beat for {getActLabel(selectedAct)}
            </div>
            <div className="flex flex-wrap gap-1">
              {getActBeats(selectedAct).map((beat) => (
                <button
                  key={beat}
                  onClick={() => handleActSelection(selectedAct, beat)}
                  className={cn(
                    'text-xs px-2 py-1 rounded border',
                    tags.some(tag => tag.includes(beat)) ? getActColor(selectedAct) : 'bg-white text-gray-600 border-gray-200'
                  )}
                >
                  {beat}
                </button>
              ))}
            </div>
          </div>
        )}
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
