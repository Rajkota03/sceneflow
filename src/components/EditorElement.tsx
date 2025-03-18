import React, { useState, useRef, useEffect } from 'react';
import { ElementType, ScriptElement, Structure } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import { detectCharacter } from '@/lib/characterUtils';
import SceneTags from './SceneTags';
import { BeatMode } from '@/types/scriptTypes';
import { formatType } from '@/lib/formatScript';

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
      return 'font-bold uppercase tracking-wider mb-4';
    case 'action':
      return 'mb-4';
    case 'character':
      return 'text-center font-bold mb-1 mx-auto';
    case 'dialogue':
      return 'mb-4 mx-auto';
    case 'parenthetical':
      return 'text-center italic mb-1 mx-auto';
    case 'transition':
      return 'text-right font-bold uppercase tracking-wider mb-4';
    case 'note':
      return 'text-sm italic text-gray-500 mb-2';
    default:
      return 'mb-4';
  }
};

const getElementStyles = (type: ElementType): React.CSSProperties => {
  switch (type) {
    case 'scene-heading':
      return {
        width: '100%',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      };
    case 'action':
      return {
        width: '100%'
      };
    case 'character':
      return {
        width: '30%',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: 'auto',
        marginRight: 'auto'
      };
    case 'dialogue':
      return {
        width: '65%',
        marginLeft: 'auto',
        marginRight: 'auto'
      };
    case 'parenthetical':
      return {
        width: '40%',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontStyle: 'italic'
      };
    case 'transition':
      return {
        width: '100%',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      };
    case 'note':
      return {
        width: '100%',
        fontStyle: 'italic',
        color: '#666'
      };
    default:
      return { width: '100%' };
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
  const [showElementMenu, setShowElementMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setText(element.text);
    if (editorRef.current && isActive) {
      editorRef.current.innerText = element.text;
      // Set cursor at the end of the text
      const range = document.createRange();
      const sel = window.getSelection();
      if (editorRef.current.childNodes.length > 0) {
        range.setStartAfter(editorRef.current.childNodes[editorRef.current.childNodes.length - 1]);
      } else {
        range.setStart(editorRef.current, 0);
      }
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
      editorRef.current.focus();
    }
  }, [element.text, isActive]);

  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
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
    if (e.key === 'Backspace' && text.trim() === '') {
      e.preventDefault();
      onNavigate('up', element.id);
      return;
    }
    
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          onFormatChange(element.id, 'scene-heading');
          return;
        case '2':
          e.preventDefault();
          onFormatChange(element.id, 'action');
          return;
        case '3':
          e.preventDefault();
          onFormatChange(element.id, 'character');
          return;
        case '4':
          e.preventDefault();
          onFormatChange(element.id, 'dialogue');
          return;
        case '5':
          e.preventDefault();
          onFormatChange(element.id, 'parenthetical');
          return;
        case 'r':
          if (e.shiftKey) {
            e.preventDefault();
            onFormatChange(element.id, 'transition');
            setText('CUT TO:');
            onChange(element.id, 'CUT TO:', 'transition');
          }
          return;
        default:
          break;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterKey(element.id, e.shiftKey);
    } else if (e.key === 'ArrowUp') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.max(0, prevIndex - 1));
      } else {
        onNavigate('up', element.id);
      }
    } else if (e.key === 'ArrowDown') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.min(filteredSuggestions.length - 1, prevIndex + 1));
      } else {
        onNavigate('down', element.id);
      }
    } else if (suggestionsVisible && filteredSuggestions.length > 0 && e.key === 'Tab') {
      e.preventDefault();
      handleSelectCharacter(filteredSuggestions[focusIndex]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (element.type === 'dialogue') {
        onFormatChange(element.id, 'parenthetical');
        if (!text.startsWith('(') && !text.endsWith(')')) {
          const newText = `(${text})`;
          setText(newText);
          onChange(element.id, newText, 'parenthetical');
        }
      } else {
        const elementTypes: ElementType[] = [
          'scene-heading',
          'action',
          'character',
          'dialogue',
          'parenthetical',
          'transition'
        ];
        
        const currentIndex = elementTypes.indexOf(element.type);
        const nextIndex = (currentIndex + 1) % elementTypes.length;
        
        onFormatChange(element.id, elementTypes[nextIndex]);
      }
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

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowElementMenu(!showElementMenu);
  };

  const handleElementTypeChange = (newType: ElementType) => {
    onFormatChange(element.id, newType);
    setShowElementMenu(false);
  };

  const elementStyles = getElementStyles(element.type);

  return (
    <div 
      className={`element-container ${element.type} ${isActive ? 'active' : ''} relative group`} 
      onContextMenu={handleRightClick}
    >
      <div className="absolute -left-16 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isActive && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <button
              onClick={() => setShowElementMenu(!showElementMenu)}
              className="px-1.5 py-0.5 text-blue-600 hover:bg-gray-100 rounded"
            >
              {formatType(element.type)}
            </button>
          </div>
        )}
      </div>
      
      <div
        ref={editorRef}
        className={`
          element-text 
          ${renderStyle(element.type, previousElementType)}
          ${isActive ? 'active-element' : ''}
        `}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={onFocus}
        onBlur={() => setSuggestionsVisible(false)}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
          ...elementStyles
        }}
        dir="ltr"
      >
        {text}
      </div>
      
      {isActive && (
        <>
          {suggestionsVisible && (
            <CharacterSuggestions 
              suggestions={filteredSuggestions} 
              onSelect={handleSelectCharacter} 
              focusIndex={focusIndex}
            />
          )}
          
          {element.type === 'scene-heading' && beatMode === 'on' && (
            <div className="absolute right-0 top-0">
              <SceneTags 
                element={element} 
                onTagsChange={onTagsChange} 
                projectId={projectId}
                selectedStructure={selectedStructure}
                onBeatTag={onBeatTag}
              />
            </div>
          )}
          
          {showElementMenu && (
            <div className="absolute top-full left-0 w-48 bg-white border border-gray-300 shadow-md rounded-md z-50">
              {['scene-heading', 'action', 'character', 'dialogue', 'parenthetical', 'transition'].map((type) => (
                <div 
                  key={type}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${element.type === type ? 'bg-gray-100' : ''}`}
                  onClick={() => handleElementTypeChange(type as ElementType)}
                >
                  {formatType(type as ElementType)}
                  <span className="text-xs text-gray-500 ml-2">
                    {type === 'scene-heading' && '⌘1'}
                    {type === 'action' && '⌘2'}
                    {type === 'character' && '⌘3'}
                    {type === 'dialogue' && '⌘4'}
                    {type === 'parenthetical' && '⌘5'}
                    {type === 'transition' && '⇧⌘R'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditorElement;
