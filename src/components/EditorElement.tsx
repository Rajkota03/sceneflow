
import React, { useState, useRef, useEffect } from 'react';
import { ElementType, ScriptElement, Structure } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import { detectCharacter } from '@/lib/characterUtils';
import SceneTags from './SceneTags';
import { BeatMode } from '@/types/scriptTypes';
import SceneTagButton from './SceneTagButton';

interface EditorElementProps {
  element: ScriptElement;
  previousElementType?: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  onTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const renderStyle = (type: ElementType, previousElementType?: ElementType) => {
  switch (type) {
    case 'scene-heading':
      return 'font-bold uppercase tracking-wider my-2';
    case 'action':
      return 'my-1';
    case 'character':
      return 'text-center font-bold my-1';
    case 'dialogue':
      return 'my-1';
    case 'parenthetical':
      return 'text-center italic text-sm text-gray-600 my-1';
    case 'transition':
      return 'text-right font-bold uppercase tracking-wider my-2';
    case 'note':
      return 'text-sm italic text-gray-500 my-1';
    default:
      return 'my-1';
  }
};

// Helper function to get background highlight for tagged scenes
const getSceneHighlight = (element: ScriptElement): string => {
  if (element.type !== 'scene-heading' || !element.tags || element.tags.length === 0) {
    return '';
  }
  
  // Check for act tags and apply appropriate color
  if (element.tags.some(tag => tag.startsWith('Act 1:'))) {
    return 'bg-[#D3E4FD] bg-opacity-20';
  } else if (element.tags.some(tag => tag.startsWith('Act 2A:'))) {
    return 'bg-[#FEF7CD] bg-opacity-20';
  } else if (element.tags.some(tag => tag.startsWith('Midpoint:'))) {
    return 'bg-[#FFCCCB] bg-opacity-20';
  } else if (element.tags.some(tag => tag.startsWith('Act 2B:'))) {
    return 'bg-[#FDE1D3] bg-opacity-20';
  } else if (element.tags.some(tag => tag.startsWith('Act 3:'))) {
    return 'bg-[#F2FCE2] bg-opacity-20';
  }
  
  return '';
};

const EditorElement: React.FC<EditorElementProps> = ({ 
  element, 
  previousElementType, 
  onChange, 
  onFocus, 
  isActive, 
  onNavigate, 
  onEnterKey, 
  onFormatChange, 
  onTagsChange,
  characterNames,
  projectId,
  beatMode = 'on',
  selectedStructure,
  onBeatTag
}) => {
  const [text, setText] = useState(element.text);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setText(element.text);
  }, [element.text]);

  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newText = e.target.innerText;
    setText(newText);
    onChange(element.id, newText, element.type);
    
    if (element.type === 'character') {
      const detected = detectCharacter(newText, characterNames);
      setSuggestionsVisible(detected);
      
      if (detected) {
        const searchText = newText.toLowerCase();
        const newSuggestions = characterNames.filter(name =>
          name.toLowerCase().startsWith(searchText) && name !== newText
        );
        setFilteredSuggestions(newSuggestions);
        setFocusIndex(0);
      }
    } else {
      setSuggestionsVisible(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterKey(element.id, e.shiftKey);
    } else if (e.key === 'ArrowUp') {
      onNavigate('up', element.id);
    } else if (e.key === 'ArrowDown') {
      onNavigate('down', element.id);
    } else if (suggestionsVisible && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      setFocusIndex(prevIndex => {
        const newIndex = e.key === 'ArrowLeft' ? prevIndex - 1 : prevIndex + 1;
        return Math.max(0, Math.min(newIndex, filteredSuggestions.length - 1));
      });
    } else if (suggestionsVisible && e.key === 'Tab') {
      e.preventDefault();
      handleSelectCharacter(filteredSuggestions[focusIndex]);
    }
  };

  const handleSelectCharacter = (name: string) => {
    if (editorRef.current) {
      editorRef.current.innerText = name;
      setText(name);
      onChange(element.id, name, element.type);
      setSuggestionsVisible(false);
    }
  };

  // Determine if this element is a scene heading and should have the tag button
  const isSceneHeading = element.type === 'scene-heading';
  const sceneHighlight = getSceneHighlight(element);

  return (
    <div 
      className={`editor-element ${element.type} ${isActive ? 'active' : ''} relative ${sceneHighlight} rounded`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={editorRef}
        className={`
          element-text 
          ${renderStyle(element.type, previousElementType)}
          ${isActive ? 'active' : ''}
          ${isSceneHeading ? 'pr-28' : ''}
        `}
        contentEditable={isActive}
        suppressContentEditableWarning={true}
        onFocus={onFocus}
        onBlur={() => setSuggestionsVisible(false)}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {text}
      </div>
      
      {/* Floating Tag Scene button on hover for scene headings */}
      {isSceneHeading && isHovered && !isActive && beatMode === 'on' && (
        <div className="absolute right-2 top-0">
          <SceneTagButton 
            onTagSelect={(tagType, actType, beatId) => {
              // Focus this element first
              onFocus();
              
              // Handle tag selection
              if (tagType === 'act' && actType) {
                const actTag = actType === ActType.ACT_1 ? 'Act 1: Setup' :
                              actType === ActType.ACT_2A ? 'Act 2A: Reaction' :
                              actType === ActType.MIDPOINT ? 'Midpoint: Turning Point' :
                              actType === ActType.ACT_2B ? 'Act 2B: Approach' :
                              'Act 3: Resolution';
                              
                // Remove existing act tags
                const filteredTags = (element.tags || []).filter(tag => 
                  !tag.startsWith('Act 1:') && 
                  !tag.startsWith('Act 2A:') && 
                  !tag.startsWith('Midpoint:') && 
                  !tag.startsWith('Act 2B:') && 
                  !tag.startsWith('Act 3:')
                );
                
                onTagsChange(element.id, [...filteredTags, actTag]);
              }
              else if (tagType === 'beat' && beatId && actType && selectedStructure) {
                // Find the beat in the selected structure
                let beatName = '';
                selectedStructure.acts?.forEach(act => {
                  if (act.act_type === actType) {
                    act.beats?.forEach(beat => {
                      if (beat.id === beatId) {
                        beatName = beat.name;
                      }
                    });
                  }
                });
                
                if (beatName && onBeatTag) {
                  // Get the act ID based on act type
                  const actId = selectedStructure.acts?.find(act => act.act_type === actType)?.id || '';
                  onBeatTag(element.id, beatId, actId);
                  
                  // Add a tag for this beat
                  const actPrefix = actType === ActType.ACT_1 ? 'Act 1: ' :
                                  actType === ActType.ACT_2A ? 'Act 2A: ' :
                                  actType === ActType.MIDPOINT ? 'Midpoint: ' :
                                  actType === ActType.ACT_2B ? 'Act 2B: ' :
                                  'Act 3: ';
                                  
                  const newTag = `${actPrefix}${beatName}`;
                  const existingTags = element.tags || [];
                  if (!existingTags.includes(newTag)) {
                    onTagsChange(element.id, [...existingTags, newTag]);
                  }
                }
              }
              // Custom tags are handled in the SceneTags component
            }}
            selectedStructure={selectedStructure}
            className="opacity-70 hover:opacity-100"
          />
        </div>
      )}
      
      {isActive && beatMode === 'on' && (
        <>
          {suggestionsVisible && (
            <CharacterSuggestions 
              suggestions={filteredSuggestions} 
              onSelect={handleSelectCharacter} 
              focusIndex={focusIndex}
            />
          )}
          
          {element.type === 'scene-heading' && (
            <SceneTags 
              element={element} 
              onTagsChange={onTagsChange} 
              projectId={projectId}
              selectedStructure={selectedStructure}
              onBeatTag={onBeatTag}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EditorElement;
