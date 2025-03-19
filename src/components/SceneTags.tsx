
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
import { toast } from '@/components/ui/use-toast';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const SceneTags: React.FC<SceneTagsProps> = ({ 
  element, 
  onTagsChange,
  projectId,
  selectedStructure,
  onBeatTag
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(element.tags || []);
  const [beatPopupOpen, setBeatPopupOpen] = useState(false);
  
  // Get the handleBeatTag function from the ScriptEditor context
  const { 
    handleBeatTag: contextHandleBeatTag, 
    selectedStructure: contextStructure,
    beatSceneCounts
  } = useScriptEditor();
  
  // Use the onBeatTag from props or context
  const handleBeatTagging = onBeatTag || contextHandleBeatTag;
  
  // Use the structure from context if not provided via props
  const structure = selectedStructure || contextStructure;
  
  useEffect(() => {
    setTags(element.tags || []);
  }, [element.tags]);
  
  useEffect(() => {
    console.log('SceneTags rendering for element:', element.id, {
      beat: element.beat,
      selectedStructure: structure?.id,
      handleBeatTagging: !!handleBeatTagging
    });
  }, [element.id, element.beat, structure?.id, handleBeatTagging]);
  
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
    if (handleBeatTagging) {
      handleBeatTagging(element.id, beatId, actId);
      // Show a toast for user feedback
      toast({
        description: "Scene tagged successfully",
        duration: 2000,
      });
      // Close the popup immediately after selection
      setBeatPopupOpen(false);
    } else {
      console.error('Beat tagging handler not available');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not tag scene. Handler not available.",
      });
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
            <button 
              className={cn(
                "h-6 px-2 text-xs rounded flex items-center",
                hasBeatTag 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'border border-dashed border-gray-300 text-gray-500 hover:bg-gray-100'
              )}
              onClick={() => setBeatPopupOpen(true)}
            >
              {hasBeatTag ? (
                <>
                  <Check size={14} className="mr-1" />
                  {beatDetails?.beatTitle || 'Beat'}
                </>
              ) : (
                <Map size={14} />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0 w-72 max-h-80 overflow-auto">
            {structure && (
              <BeatPopoverContent 
                selectedStructure={structure}
                elementBeatId={element.beat}
                onBeatSelect={handleBeatSelect}
              />
            )}
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
