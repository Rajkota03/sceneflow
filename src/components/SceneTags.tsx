
import React, { useState, useEffect } from 'react';
import { ScriptElement, Structure } from '@/lib/types';
import SceneTag from './SceneTag';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import StructureUnavailableMessage from './script/beat-tags/StructureUnavailableMessage';
import BeatTagButton from './script/beat-tags/BeatTagButton';
import BeatPopoverContent from './script/beat-tags/BeatPopoverContent';
import TagInputPopover from './script/beat-tags/TagInputPopover';
import { useScriptEditor } from './script-editor/ScriptEditorProvider';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
  selectedStructure?: Structure | null;
}

const SceneTags: React.FC<SceneTagsProps> = ({ 
  element, 
  onTagsChange,
  projectId,
  selectedStructure,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(element.tags || []);
  const [beatPopupOpen, setBeatPopupOpen] = useState(false);
  
  // Get the handleBeatTag function from the ScriptEditor context
  const { handleBeatTag, selectedStructure: contextStructure } = useScriptEditor();
  
  // Use the structure from context if not provided via props
  const structure = selectedStructure || contextStructure;
  
  useEffect(() => {
    setTags(element.tags || []);
  }, [element.tags]);
  
  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      onTagsChange(element.id, newTags);
      setInputValue('');
    }
  };
  
  const handleTagRemove = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    onTagsChange(element.id, newTags);
  };
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      handleTagAdd(inputValue.trim());
    }
  };
  
  // Check if we have a selected structure with acts
  const hasStructure = !!(structure && structure.acts && Array.isArray(structure.acts) && structure.acts.length > 0);
  
  // Log for debugging
  console.log('SceneTags render:', { 
    hasStructure, 
    structureId: structure?.id,
    beatPopupOpen,
    elementId: element.id,
    hasBeatTag: !!element.beat
  });
  
  // If we don't have a valid structure selected, show a message
  if (!hasStructure) {
    return <StructureUnavailableMessage />;
  }
  
  // Get all available beats from the structure
  const availableBeats = structure?.acts?.flatMap(act => 
    act.beats?.map(beat => ({
      beatId: beat.id,
      actId: act.id,
      beatTitle: beat.title,
      actTitle: act.title,
      pageRange: beat.pageRange || '',
      complete: beat.complete || false,
      sceneCount: beat.sceneCount || 0
    })) || []
  ) || [];
  
  // Check if this scene has a beat tag
  const hasBeatTag = !!element.beat;
  
  // Find the beat details if this scene has a beat tag
  const beatDetails = hasBeatTag 
    ? availableBeats.find(b => b.beatId === element.beat)
    : null;
  
  const handleBeatSelect = (beatId: string, actId: string) => {
    console.log('Beat selected:', beatId, actId, element.id);
    if (handleBeatTag) {
      handleBeatTag(element.id, beatId, actId);
      // Close the popup immediately after selection
      setBeatPopupOpen(false);
    }
  };

  return (
    <div className="flex items-center text-xs space-x-1">
      {tags.map(tag => (
        <SceneTag 
          key={tag} 
          tag={tag} 
          onRemove={() => handleTagRemove(tag)} 
        />
      ))}
      
      <div className="flex items-center space-x-1">
        {/* Beat selector popup */}
        <Popover open={beatPopupOpen} onOpenChange={setBeatPopupOpen}>
          <PopoverTrigger asChild>
            <BeatTagButton 
              hasBeatTag={hasBeatTag} 
              beatTitle={beatDetails ? beatDetails.beatTitle : ''} 
              onClick={() => {
                console.log('Beat tag button clicked, setting popup open to', !beatPopupOpen);
                setBeatPopupOpen(true);
              }}
            />
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0 w-72 max-h-80 overflow-auto">
            <BeatPopoverContent 
              selectedStructure={structure}
              elementBeatId={element.beat}
              onBeatSelect={handleBeatSelect}
            />
          </PopoverContent>
        </Popover>
        
        {/* Tag input popover */}
        <TagInputPopover 
          open={open}
          onOpenChange={setOpen}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onInputKeyDown={handleInputKeyDown}
          onTagAdd={() => handleTagAdd(inputValue.trim())}
        />
      </div>
    </div>
  );
};

export default SceneTags;
