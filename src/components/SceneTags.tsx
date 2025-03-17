
import React, { useState, useEffect } from 'react';
import { ScriptElement, ActType, Structure } from '@/lib/types';
import TagInput from './TagInput';
import { Tags, Target } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const handleBeatTagging = (beatId: string, actId: string, actType: ActType) => {
    if (onBeatTag) {
      onBeatTag(element.id, beatId, actId);
      
      // Find the beat title and act name for the tag
      if (selectedStructure) {
        const act = selectedStructure.acts.find(a => a.id === actId);
        if (act) {
          const beat = act.beats.find(b => b.id === beatId);
          if (beat) {
            // Create a tag in format "Act X: Beat Name"
            let tagPrefix = '';
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
  
  // Get the ActType based on act title
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
        <Target size={14} className="mr-1" />
        <span className="text-xs font-medium">Story Beat</span>
      </div>
      
      {/* Display beats directly without dropdown */}
      {selectedStructure && onBeatTag && (
        <div className="border rounded-md bg-white shadow-sm p-2 mb-3">
          <ScrollArea className="max-h-48" hideScrollbar={false}>
            {selectedStructure.acts.map((act) => (
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
                          isSelected 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleBeatTagging(beat.id, act.id, actType)}
                      >
                        <span>{beat.title}</span>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                               className="ml-auto">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
      
      <div className="mt-3">
        <div className="flex items-center text-gray-500 mb-1">
          <Tags size={14} className="mr-1" />
          <span className="text-xs font-medium">Scene Tags</span>
        </div>
        <TagInput
          tags={tags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      </div>
    </div>
  );
};

export default SceneTags;
