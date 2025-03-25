
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
  
  // Initialize text when element changes
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Set up cursor and focus when element becomes active
  useEffect(() => {
    if (editorRef.current && isActive) {
      // Set the text content to ensure it's up to date
      if (editorRef.current.innerText !== initialText) {
        editorRef.current.innerText = initialText;
      }

      // Focus the element and position cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      
      try {
        // Position cursor at end of text
        if (editorRef.current.childNodes.length > 0) {
          range.setStartAfter(editorRef.current.childNodes[editorRef.current.childNodes.length - 1]);
        } else {
          range.setStart(editorRef.current, 0);
        }
        
        range.collapse(true);
        
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        
        // Apply focus
        editorRef.current.focus();
      } catch (err) {
        console.error('Error setting cursor position:', err);
      }
    }
  }, [isActive, initialText]);

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
      // Modified keyboard shortcut handling to create new elements instead of changing current element
      switch (e.key) {
        case '1':
          e.preventDefault();
          // Create a new scene heading element after the current element
          onEnterKey(elementId, false);
          // We need to wait for the new element to be created before changing its type
          setTimeout(() => {
            // The onEnterKey already created a new element and changed focus to it
            // Now we just need to change its type
            const activeElements = document.querySelectorAll('.active-element');
            if (activeElements.length > 0) {
              const activeElementId = activeElements[0].closest('.element-container')?.id;
              if (activeElementId) {
                onFormatChange(activeElementId, 'scene-heading');
              }
            }
          }, 10);
          return;
        case '2':
          e.preventDefault();
          onEnterKey(elementId, false);
          setTimeout(() => {
            const activeElements = document.querySelectorAll('.active-element');
            if (activeElements.length > 0) {
              const activeElementId = activeElements[0].closest('.element-container')?.id;
              if (activeElementId) {
                onFormatChange(activeElementId, 'action');
              }
            }
          }, 10);
          return;
        case '3':
          e.preventDefault();
          onEnterKey(elementId, false);
          setTimeout(() => {
            const activeElements = document.querySelectorAll('.active-element');
            if (activeElements.length > 0) {
              const activeElementId = activeElements[0].closest('.element-container')?.id;
              if (activeElementId) {
                onFormatChange(activeElementId, 'character');
              }
            }
          }, 10);
          return;
        case '4':
          e.preventDefault();
          onEnterKey(elementId, false);
          setTimeout(() => {
            const activeElements = document.querySelectorAll('.active-element');
            if (activeElements.length > 0) {
              const activeElementId = activeElements[0].closest('.element-container')?.id;
              if (activeElementId) {
                onFormatChange(activeElementId, 'dialogue');
              }
            }
          }, 10);
          return;
        case '5':
          e.preventDefault();
          onEnterKey(elementId, false);
          setTimeout(() => {
            const activeElements = document.querySelectorAll('.active-element');
            if (activeElements.length > 0) {
              const activeElementId = activeElements[0].closest('.element-container')?.id;
              if (activeElementId) {
                onFormatChange(activeElementId, 'parenthetical');
              }
            }
          }, 10);
          return;
        case '6':
          e.preventDefault();
          onEnterKey(elementId, false);
          setTimeout(() => {
            const activeElements = document.querySelectorAll('.active-element');
            if (activeElements.length > 0) {
              const activeElementId = activeElements[0].closest('.element-container')?.id;
              if (activeElementId) {
                onFormatChange(activeElementId, 'transition');
                // For transitions, we might want to set default text
                const newElement = document.querySelector('.active-element');
                if (newElement && newElement.textContent?.trim() === '') {
                  newElement.textContent = 'CUT TO:';
                  onChange(activeElementId, 'CUT TO:', 'transition');
                }
              }
            }
          }, 10);
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
    setShowElementMenu
  };
}

export default useElementInteraction;
