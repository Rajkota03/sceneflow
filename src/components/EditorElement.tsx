
import { useState, useRef, useEffect } from 'react';
import { ScriptElement, ElementType } from '../lib/types';
import { formatScriptElement } from '../lib/formatScript';
import CharacterSuggestions from './CharacterSuggestions';
import SceneTags from './SceneTags';

interface EditorElementProps {
  element: ScriptElement;
  previousElementType?: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newFormat: ElementType) => void;
  onTagsChange?: (elementId: string, tags: string[]) => void;
  characterNames?: string[];
}

const EditorElement = ({ 
  element, 
  previousElementType, 
  onChange, 
  onFocus,
  isActive,
  onNavigate,
  onEnterKey,
  onFormatChange,
  onTagsChange,
  characterNames = []
}: EditorElementProps) => {
  const [text, setText] = useState(element.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [elementType, setElementType] = useState<ElementType>(element.type);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Focus on this element if it's active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  // Update local state when element type changes from outside
  useEffect(() => {
    setElementType(element.type);
  }, [element.type]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange(element.id, newText, elementType);
    
    // Show character suggestions if this is a character element
    if (elementType === 'character' && characterNames.length > 0) {
      const filtered = characterNames.filter(name => 
        name.toLowerCase().includes(newText.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  const handleSelectCharacter = (character: string) => {
    setText(character);
    onChange(element.id, character, elementType);
    setShowSuggestions(false);
  };

  // Handle keyboard events for navigation and formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    // Handle arrow key navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const { selectionStart, value } = textarea;
      
      // If suggestions are showing and arrow keys are pressed, let the dropdown handle it
      if (showSuggestions && elementType === 'character') {
        return;
      }
      
      // Calculate current cursor position
      let cursorLineIndex = 0;
      let charCount = 0;
      
      for (let i = 0; i < value.split('\n').length; i++) {
        const lineLength = value.split('\n')[i].length;
        if (charCount <= selectionStart && selectionStart <= charCount + lineLength) {
          cursorLineIndex = i;
          break;
        }
        // Add line length plus newline character
        charCount += lineLength + 1;
      }
      
      // Navigate to previous/next element when at boundaries
      if ((e.key === 'ArrowUp' && cursorLineIndex === 0 && selectionStart === 0)) {
        e.preventDefault();
        onNavigate('up', element.id);
        return;
      } 
      
      if ((e.key === 'ArrowDown' && cursorLineIndex === value.split('\n').length - 1 && 
           selectionStart >= value.length - 1)) {
        e.preventDefault();
        onNavigate('down', element.id);
        return;
      }
      
      // Let browser handle within-element navigation
      return;
    }
    
    // Hide suggestions on Escape
    if (e.key === 'Escape' && showSuggestions) {
      e.preventDefault();
      setShowSuggestions(false);
      return;
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
      // If suggestions are showing, select the first one
      if (showSuggestions && filteredSuggestions.length > 0) {
        e.preventDefault();
        handleSelectCharacter(filteredSuggestions[0]);
        return;
      }
      
      e.preventDefault();
      onEnterKey(element.id, e.shiftKey);
      return;
    }
    
    // Handle Tab key for cycling through element types
    if (e.key === 'Tab') {
      e.preventDefault();
      
      let newType: ElementType = 'action';
      
      if (elementType === 'action') {
        newType = 'character';
      } else if (elementType === 'character') {
        newType = 'scene-heading';
      } else if (elementType === 'scene-heading') {
        newType = 'transition';
      } else if (elementType === 'transition') {
        newType = 'action';
      }
      
      onFormatChange(element.id, newType);
      return;
    }
    
    // Handle keyboard shortcuts for element type formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          onFormatChange(element.id, 'scene-heading');
          break;
        case '2':
          e.preventDefault();
          onFormatChange(element.id, 'action');
          break;
        case '3':
          e.preventDefault();
          onFormatChange(element.id, 'character');
          break;
        case '4':
          e.preventDefault();
          onFormatChange(element.id, 'dialogue');
          break;
        case '5':
          e.preventDefault();
          onFormatChange(element.id, 'parenthetical');
          break;
        case '6':
          e.preventDefault();
          onFormatChange(element.id, 'transition');
          break;
      }
    }
  };

  // Adjust textarea height to content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Get element class and spacing based on type and context
  const getElementClass = () => {
    const baseClass = `element-container ${elementType}`;
    
    // Add proper spacing based on screenplay format rules
    if (elementType === 'scene-heading') {
      return `${baseClass} mt-6`;
    }
    if (elementType === 'character') {
      return `${baseClass} mt-4`;
    }
    if (elementType === 'dialogue' && previousElementType !== 'character' && previousElementType !== 'parenthetical') {
      return `${baseClass} mt-1`;
    }
    if (elementType === 'transition') {
      return `${baseClass} mt-4`;
    }
    
    return baseClass;
  };

  // Set the text alignment based on element type
  const getTextAlignment = (): 'left' | 'center' | 'right' => {
    switch (elementType) {
      case 'character':
        return 'center';
      case 'parenthetical':
        return 'center';
      case 'transition':
        return 'right';
      case 'dialogue':
        return 'center';
      default:
        return 'left';
    }
  };

  // Hide suggestions when this element loses focus
  const handleBlur = () => {
    // Use a timeout to allow clicks on the suggestions to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={getElementClass()} style={{ position: 'relative' }}>
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={handleBlur}
        className="w-full bg-transparent resize-none outline-none"
        placeholder={getPlaceholderText(elementType)}
        rows={1}
        style={{ 
          fontFamily: 'Courier Prime, monospace',
          caretColor: '#1E293B',
          textAlign: getTextAlignment(),
          lineHeight: 1.2,
          minHeight: '1.2em'
        }}
      />
      {elementType === 'character' && (
        <CharacterSuggestions 
          suggestions={filteredSuggestions}
          onSelect={handleSelectCharacter}
          isVisible={showSuggestions && isActive}
        />
      )}
      
      {/* Add scene tags component for scene headings when active */}
      {elementType === 'scene-heading' && isActive && onTagsChange && (
        <SceneTags 
          element={element}
          onTagsChange={onTagsChange}
        />
      )}
    </div>
  );
};

function getPlaceholderText(type: ElementType): string {
  switch (type) {
    case 'scene-heading':
      return 'INT/EXT. LOCATION - TIME OF DAY (Ctrl+1)';
    case 'action':
      return 'Describe the action... (Ctrl+2)';
    case 'character':
      return 'CHARACTER NAME (Ctrl+3)';
    case 'dialogue':
      return 'Character dialogue... (Ctrl+4)';
    case 'parenthetical':
      return '(action) (Ctrl+5)';
    case 'transition':
      return 'TRANSITION TO: (Ctrl+6)';
    case 'note':
      return 'Note to self...';
    default:
      return '';
  }
}

export default EditorElement;
