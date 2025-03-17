
import React, { useState, useRef, useEffect } from 'react';
import { ElementType, ScriptElement, Structure } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import { detectCharacter } from '@/lib/characterUtils';
import SceneTags from './SceneTags';
import { BeatMode } from '@/types/scriptTypes';

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

  return (
    <div className={`editor-element ${element.type} ${isActive ? 'active' : ''}`}>
      <div
        ref={editorRef}
        className={`
          element-text 
          ${renderStyle(element.type, previousElementType)}
          ${isActive ? 'active' : ''}
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
          wordBreak: 'break-word',
          direction: 'ltr', // Ensure text direction is left-to-right
          unicodeBidi: 'bidi-override' // Additional property for text direction
        }}
        dir="ltr" // HTML attribute for text direction
      >
        {text}
      </div>
      
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
