
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ScriptElement, ElementType } from '@/lib/types';
import { useScriptEditor } from './ScriptEditorProvider';
import { detectElementType, formatScriptElement } from '@/lib/formatScript';
import { renderStyle } from '@/lib/elementStyles';
import CharacterSuggestions from '../CharacterSuggestions';
import ElementTypeMenu from '../editor/ElementTypeMenu';
import SceneTags from '../SceneTags';
import { cn } from '@/lib/utils';
import { shouldAddContd, processCharacterName } from '@/lib/characterUtils';

interface ScriptElementProps {
  element: ScriptElement;
  index: number;
  isActive: boolean;
}

const ScriptElementEditor: React.FC<ScriptElementProps> = ({ 
  element, 
  index,
  isActive 
}) => {
  const { 
    elements, 
    updateElement, 
    addElement, 
    deleteElement, 
    changeElementType,
    setActiveElement 
  } = useScriptEditor();
  
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [text, setText] = useState(element.text);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionFocusIndex, setSuggestionFocusIndex] = useState(0);
  
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Get unique character names from the script
  const characterNames = React.useMemo(() => {
    return elements
      .filter(el => el.type === 'character')
      .map(el => el.text.replace(/\s*\(CONT'D\)\s*$/, '').trim())
      .filter((value, index, self) => self.indexOf(value) === index);
  }, [elements]);

  // Set initial focus when the element becomes active
  useEffect(() => {
    if (isActive && elementRef.current) {
      elementRef.current.focus();
      // Select all text when focusing on empty elements
      if (!text && elementRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(elementRef.current);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }, [isActive, text]);

  // Update local state when element props change
  useEffect(() => {
    setText(element.text);
  }, [element.text]);

  // Handle character suggestions
  useEffect(() => {
    if (isActive && element.type === 'character' && text) {
      const matchingNames = characterNames
        .filter(name => 
          name.toLowerCase().startsWith(text.toLowerCase()) && 
          name.toLowerCase() !== text.toLowerCase()
        );
      setSuggestions(matchingNames);
      setShowSuggestions(matchingNames.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [isActive, text, element.type, characterNames]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Handle character suggestions navigation
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionFocusIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionFocusIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleSelectSuggestion(suggestions[suggestionFocusIndex]);
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If this is a character element, create a dialog element below
      if (element.type === 'character') {
        addElement(element.id, 'dialogue');
      } 
      // If this is a scene heading, create an action element below
      else if (element.type === 'scene-heading') {
        addElement(element.id, 'action');
      }
      // For regular elements, create a new element of the same type
      else {
        const newId = addElement(element.id, element.type);
        if (newId) {
          setActiveElement(newId);
        }
      }
    }
    
    // Handle Backspace on empty element to delete it
    if (e.key === 'Backspace' && text === '') {
      // Don't delete the last element
      if (elements.length > 1) {
        e.preventDefault();
        deleteElement(element.id);
        
        // Select the previous element
        const currentIndex = elements.findIndex(el => el.id === element.id);
        if (currentIndex > 0) {
          setActiveElement(elements[currentIndex - 1].id);
        } else if (elements.length > currentIndex + 1) {
          setActiveElement(elements[currentIndex + 1].id);
        }
      }
    }
    
    // Handle Tab key for element indentation/type change
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (element.type === 'action') {
        changeElementType(element.id, 'character');
      } else if (element.type === 'dialogue') {
        changeElementType(element.id, 'parenthetical');
      }
    }
    
    // Handle keyboard shortcuts for element types
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          changeElementType(element.id, 'scene-heading');
          break;
        case '2':
          e.preventDefault();
          changeElementType(element.id, 'action');
          break;
        case '3':
          e.preventDefault();
          changeElementType(element.id, 'character');
          break;
        case '4':
          e.preventDefault();
          changeElementType(element.id, 'dialogue');
          break;
        case '5':
          e.preventDefault();
          changeElementType(element.id, 'parenthetical');
          break;
        case '6':
          e.preventDefault();
          changeElementType(element.id, 'transition');
          break;
      }
    }
    
    // Handle keyboard shortcut for transitions
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      changeElementType(element.id, 'transition');
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    setText(newText);
    
    // Automatically detect and change element type based on content
    if (element.type === 'action') {
      // Detect if this should be a scene heading (starts with INT. or EXT.)
      if (/^(INT|EXT|INT\/EXT|I\/E)[\s\.]/.test(newText.toUpperCase())) {
        changeElementType(element.id, 'scene-heading');
      }
      // Detect if this should be a transition (ends with TO:)
      else if (/^[A-Z\s]+TO:$/.test(newText)) {
        changeElementType(element.id, 'transition');
      }
      // Detect if this should be a character (ALL CAPS)
      else if (/^[A-Z][A-Z\s']+$/.test(newText) && newText.length > 1) {
        changeElementType(element.id, 'character');
      }
    }
    
    // Format text based on element type
    const formattedText = formatScriptElement({ type: element.type, text: newText });
    updateElement(element.id, formattedText);
  };

  const handleBlur = () => {
    // Final formatting and processing of the element when focus is lost
    if (element.type === 'character') {
      // Process character name for CONT'D
      const processedName = processCharacterName(text, index, elements);
      updateElement(element.id, processedName);
    }
    
    // Hide suggestions and type menu when focus is lost
    setShowSuggestions(false);
    setShowTypeMenu(false);
  };

  const handleFocus = () => {
    setActiveElement(element.id);
  };

  const handleSelectSuggestion = (selectedCharacter: string) => {
    setText(selectedCharacter);
    updateElement(element.id, selectedCharacter);
    setShowSuggestions(false);
  };

  const handleElementTypeChange = (newType: ElementType) => {
    changeElementType(element.id, newType);
    setShowTypeMenu(false);
  };

  const handleDoubleClick = () => {
    setShowTypeMenu(true);
  };

  return (
    <div className={`element-container ${element.type} relative mb-2`}>
      {/* Element type menu */}
      {showTypeMenu && (
        <ElementTypeMenu 
          currentType={element.type} 
          onElementTypeChange={handleElementTypeChange} 
        />
      )}
      
      {/* Character suggestions */}
      {showSuggestions && element.type === 'character' && (
        <CharacterSuggestions 
          suggestions={suggestions}
          onSelect={handleSelectSuggestion}
          isVisible={showSuggestions}
          focusIndex={suggestionFocusIndex}
        />
      )}
      
      {/* Editable element */}
      <div
        ref={elementRef}
        className={cn(
          `element-text ${renderStyle(element.type)}`,
          isActive && 'active-element'
        )}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onDoubleClick={handleDoubleClick}
        dangerouslySetInnerHTML={{ __html: text || (
          element.type === 'scene-heading' ? '<span class="text-gray-300">INT./EXT. LOCATION - TIME</span>' :
          element.type === 'character' ? '<span class="text-gray-300">CHARACTER NAME</span>' :
          element.type === 'dialogue' ? '<span class="text-gray-300">Character dialogue...</span>' :
          element.type === 'parenthetical' ? '<span class="text-gray-300">(action)</span>' :
          element.type === 'transition' ? '<span class="text-gray-300">CUT TO:</span>' :
          '<span class="text-gray-300">Start typing...</span>'
        )}}
      />
      
      {/* Scene tags if this is a scene heading */}
      {element.type === 'scene-heading' && (
        <div className="absolute right-0 top-0">
          <SceneTags 
            element={element} 
            onTagsChange={(id, tags) => updateElement(id, element.text, element.type)}
          />
        </div>
      )}
    </div>
  );
};

export default ScriptElementEditor;
