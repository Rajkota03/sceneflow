
import { useState, useRef, useEffect } from 'react';
import { ElementType } from '@/lib/types';
import { detectCharacter } from '@/lib/characterUtils';

interface UseElementInteractionProps {
  elementId: string;
  text: string;
  type: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  isActive: boolean;
  characterNames: string[];
}

export function useElementInteraction({
  elementId,
  text: initialText,
  type,
  onChange,
  onNavigate,
  onEnterKey,
  onFormatChange,
  isActive,
  characterNames
}: UseElementInteractionProps) {
  const [text, setText] = useState(initialText);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [showElementMenu, setShowElementMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Sync text state with initialText from props
  useEffect(() => {
    setText(initialText);
    // Only update the DOM directly if the element isn't active
    // When active, leave the DOM alone to prevent cursor jumping
    if (editorRef.current && !isActive && editorRef.current.innerText !== initialText) {
      editorRef.current.innerText = initialText;
    }
  }, [initialText, isActive]);
  
  // Set focus when element becomes active
  useEffect(() => {
    if (isActive && editorRef.current) {
      // Focus the element with a small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        // Only set focus if document.activeElement is not already this element
        // This prevents cursor from jumping when clicking within the text
        if (document.activeElement !== editorRef.current) {
          editorRef.current?.focus();
          
          // Only position cursor at the end if this is a fresh focus, not a click within text
          if (window.getSelection()?.rangeCount === 0) {
            const range = document.createRange();
            const sel = window.getSelection();
            
            if (editorRef.current) {
              try {
                if (editorRef.current.childNodes.length > 0) {
                  const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
                  const offset = lastNode.textContent?.length || 0;
                  range.setStart(lastNode, offset);
                } else {
                  // If no child nodes, set cursor at beginning of empty div
                  range.setStart(editorRef.current, 0);
                }
                
                range.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(range);
              } catch (e) {
                console.error('Error setting cursor position:', e);
              }
            }
          }
        }
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isActive]);

  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const newText = e.currentTarget.innerText;
    
    // Only update if text actually changed
    if (newText !== text) {
      setText(newText);
      onChange(elementId, newText, type);
      
      if (type === 'character') {
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Only prevent default for navigation keys when they should be intercepted
    if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab'].includes(e.key)) {
      // For arrow keys, only prevent default if suggestions are visible
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !suggestionsVisible) {
        // Allow cursor movement within the text if there are multiple lines and we're not at boundaries
        const selection = window.getSelection();
        const textContent = editorRef.current?.textContent || '';
        
        if (textContent.includes('\n')) {
          const cursorAtStart = selection?.anchorOffset === 0;
          const cursorAtEnd = selection?.anchorOffset === textContent.length;
          
          // Only prevent default if we're at boundaries
          if ((e.key === 'ArrowUp' && cursorAtStart) || 
              (e.key === 'ArrowDown' && cursorAtEnd)) {
            e.preventDefault();
          } else {
            return; // Let the browser handle within-text navigation
          }
        } else {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    }
    
    if (e.key === 'Backspace' && text.trim() === '') {
      e.preventDefault();
      onNavigate('up', elementId);
      return;
    }
    
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          onFormatChange(elementId, 'scene-heading');
          return;
        case '2':
          e.preventDefault();
          onFormatChange(elementId, 'action');
          return;
        case '3':
          e.preventDefault();
          onFormatChange(elementId, 'character');
          return;
        case '4':
          e.preventDefault();
          onFormatChange(elementId, 'dialogue');
          return;
        case '5':
          e.preventDefault();
          onFormatChange(elementId, 'parenthetical');
          return;
        case '6':
          e.preventDefault();
          onFormatChange(elementId, 'transition');
          const newText = text.trim() === '' ? 'CUT TO:' : text;
          setText(newText);
          onChange(elementId, newText, 'transition');
          return;
        default:
          break;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onEnterKey(elementId, e.shiftKey);
    } else if (e.key === 'ArrowUp') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.max(0, prevIndex - 1));
      } else {
        onNavigate('up', elementId);
      }
    } else if (e.key === 'ArrowDown') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.min(filteredSuggestions.length - 1, prevIndex + 1));
      } else {
        onNavigate('down', elementId);
      }
    } else if (suggestionsVisible && filteredSuggestions.length > 0 && e.key === 'Tab') {
      e.preventDefault();
      handleSelectCharacter(filteredSuggestions[focusIndex]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (type === 'dialogue') {
        onFormatChange(elementId, 'parenthetical');
        if (!text.startsWith('(') && !text.endsWith(')')) {
          const newText = `(${text})`;
          setText(newText);
          onChange(elementId, newText, 'parenthetical');
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
        
        const currentIndex = elementTypes.indexOf(type);
        const nextIndex = (currentIndex + 1) % elementTypes.length;
        
        onFormatChange(elementId, elementTypes[nextIndex]);
      }
    }
  };

  const handleSelectCharacter = (name: string) => {
    if (editorRef.current) {
      editorRef.current.innerText = name;
      setText(name);
      onChange(elementId, name, type);
      setSuggestionsVisible(false);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowElementMenu(!showElementMenu);
  };

  const handleElementTypeChange = (newType: ElementType) => {
    onFormatChange(elementId, newType);
    setShowElementMenu(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only hide menus if we're not focusing a related element (like suggestions)
    // Check if the related target is a child of our suggestions
    let isSuggestionClick = false;
    
    if (e.relatedTarget && suggestionsVisible) {
      const suggestionElements = document.querySelectorAll('.character-suggestion-item');
      suggestionElements.forEach(el => {
        if (el.contains(e.relatedTarget as Node)) {
          isSuggestionClick = true;
        }
      });
    }
    
    if (!isSuggestionClick) {
      // Hide element menu regardless
      setShowElementMenu(false);
      
      // Hide suggestions with a small delay to allow clicks to register
      const timeoutId = setTimeout(() => {
        setSuggestionsVisible(false);
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  };

  return {
    text,
    editorRef,
    suggestionsVisible,
    filteredSuggestions,
    focusIndex,
    showElementMenu,
    handleChange,
    handleKeyDown,
    handleSelectCharacter,
    handleRightClick,
    handleElementTypeChange,
    setShowElementMenu,
    handleBlur
  };
}

export default useElementInteraction;
