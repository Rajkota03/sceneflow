
import React, { useState, useEffect } from 'react';
import { ScriptElement, ActType, Structure } from '@/lib/types';
import TagInput from './TagInput';
import { Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      case ActType.ACT_1: prefix = 'Act 1: '; break;
      case ActType.ACT_2A: prefix = 'Act 2A: '; break;
      case ActType.MIDPOINT: prefix = 'Midpoint: '; break;
      case ActType.ACT_2B: prefix = 'Act 2B: '; break;
      case ActType.ACT_3: prefix = 'Act 3: '; break;
    }
    
    const newTag = `${prefix}${beatName}`;
    const newTags = [...filteredTags, newTag];
    
    setTags(newTags);
    setSelectedAct(act);
    onTagsChange(element.id, newTags);
  };

  const handleBeatTagging = (elementId: string, beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(elementId, beatId, actId);
    }
  };

  if (element.type !== 'scene-heading') {
    return null;
  }

  const getActColor = (act: ActType): string => {
    switch (act) {
      case ActType.ACT_1: return 'bg-[#D3E4FD] border-[#4A90E2] text-[#2171D2]';
      case ActType.ACT_2A: return 'bg-[#FEF7CD] border-[#F5A623] text-[#D28A21]';
      case ActType.MIDPOINT: return 'bg-[#FFCCCB] border-[#FF9E9D] text-[#D24E4D]';
      case ActType.ACT_2B: return 'bg-[#FDE1D3] border-[#F57C00] text-[#D26600]';
      case ActType.ACT_3: return 'bg-[#F2FCE2] border-[#009688] text-[#007F73]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActLabel = (act: ActType): string => {
    switch (act) {
      case ActType.ACT_1: return 'Act 1';
      case ActType.ACT_2A: return 'Act 2A';
      case ActType.MIDPOINT: return 'Midpoint';
      case ActType.ACT_2B: return 'Act 2B';
      case ActType.ACT_3: return 'Act 3';
      default: return '';
    }
  };

  const getActBeats = (act: ActType): string[] => {
    switch (act) {
      case ActType.ACT_1:
        return ['Hook', 'Setup', 'Inciting Incident', 'First Plot Point'];
      case ActType.ACT_2A:
        return ['First Pinch Point', 'Rising Action'];
      case ActType.MIDPOINT:
        return ['Revelation', 'Shift', 'Game Changer'];
      case ActType.ACT_2B:
        return ['Second Pinch Point', 'Rising Complications'];
      case ActType.ACT_3:
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
      
      {/* Add BeatTagging component when a structure is selected */}
      {selectedStructure && onBeatTag && (
        <BeatTagging
          selectedStructure={selectedStructure}
          elementId={element.id}
          onBeatTag={handleBeatTagging}
          selectedBeatId={element.beat}
        />
      )}
      
      <div className="mb-2">
        <div className="text-xs font-medium mb-1 text-gray-500">Script Structure</div>
        <div className="grid grid-cols-5 gap-1 mb-2">
          {([ActType.ACT_1, ActType.ACT_2A, ActType.MIDPOINT, ActType.ACT_2B, ActType.ACT_3]).map((act) => (
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
