import { useState, useRef, useEffect, useCallback } from 'react';
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
  
  // Initialize text when element changes
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Function to focus element and place cursor at the end
  const focusAndPlaceCursor = useCallback(() => {
    if (!editorRef.current) return;
    
    // Apply focus with a slight delay to ensure UI is ready
    setTimeout(() => {
      // Focus the element
      if (editorRef.current) {
        console.log(`Focusing element ${elementId}`);
        editorRef.current.focus();
      
        // Set text content if needed
        if (editorRef.current.innerText !== text) {
          editorRef.current.innerText = text;
        }
        
        try {
          // Position cursor at end of text
          const range = document.createRange();
          const sel = window.getSelection();
          
          // Check if element has child nodes
          if (editorRef.current.childNodes.length > 0) {
            const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
            
            if (lastNode.nodeType === Node.TEXT_NODE) {
              // If it's a text node, set cursor at the end of the text
              range.setStart(lastNode, lastNode.textContent?.length || 0);
            } else {
              // Otherwise set cursor after the last node
              range.setStartAfter(lastNode);
            }
          } else {
            // If no child nodes, set cursor at beginning of element
            range.setStart(editorRef.current, 0);
          }
          
          range.collapse(true);
          
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch (err) {
          console.error('Error setting cursor position:', err);
        }
      }
    }, 10);
  }, [elementId, text]);

  // Set up cursor and focus when element becomes active
  useEffect(() => {
    if (isActive) {
      focusAndPlaceCursor();
    }
  }, [isActive, focusAndPlaceCursor]);

  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
    setShowElementMenu(!showElementMenu);
  };

  const handleElementTypeChange = (newType: ElementType) => {
    onFormatChange(elementId, newType);
    setShowElementMenu(false);
    
    // Re-focus the element after changing type
    setTimeout(focusAndPlaceCursor, 50);
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
    focusAndPlaceCursor
  };
}

export default useElementInteraction;
