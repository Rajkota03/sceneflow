import React, { useState, useRef, useEffect } from 'react';
import { ElementType, ScriptElement, Structure, ActType } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import { detectCharacter } from '@/lib/characterUtils';
import SceneTags from './SceneTags';
import SceneTagButton from './SceneTagButton';
import BeatTagging from './BeatTagging';

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
  beatMode?: 'on' | 'off';
  selectedStructure?: any;
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

const getSceneHighlight = (element: ScriptElement): string => {
  if (element.type !== 'scene-heading' || !element.tags || element.tags.length === 0) {
    return '';
  }
  
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
  const [showBeatTagging, setShowBeatTagging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setText(element.text);
  }, [element.text]);

  // Close beat tagging UI when user starts typing in the scene heading
  useEffect(() => {
    if (isActive && element.type === 'scene-heading' && text !== element.text) {
      setShowBeatTagging(false);
    }
  }, [text, element.text, isActive, element.type]);

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
      // Hide beat tagging UI when user presses Enter in a scene heading
      if (element.type === 'scene-heading') {
        setShowBeatTagging(false);
      }
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

  const handleSceneClick = () => {
    if (element.type === 'scene-heading' && !isActive) {
      onFocus();
      setShowBeatTagging(true);
    }
  };

  // When a beat is selected, hide the UI
  const handleBeatTagged = (elementId: string, beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(elementId, beatId, actId);
      setShowBeatTagging(false);
    }
  };

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
          ${isSceneHeading ? 'pr-28 cursor-pointer' : ''}
        `}
        contentEditable={isActive}
        suppressContentEditableWarning={true}
        onFocus={onFocus}
        onBlur={() => setSuggestionsVisible(false)}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        onClick={isSceneHeading ? handleSceneClick : undefined}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {text}
      </div>
      
      {/* Show the beat tagging UI only when a scene heading is clicked and not being edited */}
      {isSceneHeading && beatMode === 'on' && (
        <>
          {showBeatTagging && selectedStructure && (
            <div className="absolute top-0 right-0 bg-white shadow-md border rounded-md p-2 z-50 w-72">
              <BeatTagging 
                selectedStructure={selectedStructure}
                elementId={element.id}
                onBeatTag={handleBeatTagged}
                selectedBeatId={element.beatId || undefined}
              />
            </div>
          )}
          
          {isActive && !showBeatTagging && (
            <>
              {suggestionsVisible && (
                <CharacterSuggestions 
                  suggestions={filteredSuggestions} 
                  onSelect={handleSelectCharacter} 
                  focusIndex={focusIndex}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EditorElement;
