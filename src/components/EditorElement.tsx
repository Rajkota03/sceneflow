
import React, { useEffect, useRef, useState } from 'react';
import { ElementType, ScriptElement } from '@/lib/types';
import { formatType } from '@/lib/formatScript';
import CharacterSuggestions from './CharacterSuggestions';
import { cn } from '@/lib/utils';
import SceneTags from './SceneTags';

interface EditorElementProps {
  element: ScriptElement;
  previousElementType?: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onFormatChange: (id: string, type: ElementType) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: 'on' | 'off';
}

const EditorElement: React.FC<EditorElementProps> = ({ 
  element, 
  previousElementType,
  onChange, 
  onFormatChange,
  onFocus, 
  isActive,
  onNavigate,
  onEnterKey,
  onTagsChange,
  characterNames,
  projectId,
  beatMode = 'on'
}) => {
  const [text, setText] = useState(element.text);
  const [elementType, setElementType] = useState(element.type);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setText(element.text);
    setElementType(element.type);
  }, [element.text, element.type]);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange(element.id, newText, elementType);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterKey(element.id, e.shiftKey);
    } else if (e.key === 'ArrowUp') {
      onNavigate('up', element.id);
    } else if (e.key === 'ArrowDown') {
      onNavigate('down', element.id);
    }
  };

  const handleTypeChange = (newType: ElementType) => {
    setElementType(newType);
    onFormatChange(element.id, newType);
  };
  
  return (
    <div className={`editor-element relative ${element.type} ${isActive ? 'active' : ''}`}>
      <div className="flex items-start">
        <div className="element-type-selector relative">
          <div 
            className="bg-gray-100 text-gray-700 rounded-l-md border border-gray-300 px-2 py-1 text-sm focus:outline-none"
          >
            {formatType(elementType)}
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          className={cn(
            "w-full p-2 text-sm focus:outline-none resize-none border-0 rounded-r-md bg-transparent",
            {
              'font-bold': elementType === 'character',
              'italic': elementType === 'action',
            }
          )}
          placeholder={elementType === 'action' ? 'Type action here...' : '...'}
        />
      </div>
      
      {isActive && element.type === 'scene-heading' && beatMode === 'on' && (
        <SceneTags 
          element={element}
          onTagsChange={onTagsChange}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default EditorElement;
