
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
  
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (editorRef.current && isActive) {
      if (editorRef.current.innerText !== initialText) {
        editorRef.current.innerText = initialText;
      }

      const range = document.createRange();
      const sel = window.getSelection();
      
      try {
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
    
    // Fixed keyboard shortcut behavior
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          
          // First create a new element with the Enter key handler
          onEnterKey(elementId, false);
          
          // Then after a short delay, update the newly created element to the desired type
          setTimeout(() => {
            // Find the newly created element which should now be active
            const activeElements = document.querySelectorAll('.active-element');
            if (activeElements.length > 0) {
              const activeElementId = activeElements[0].closest('.element-container')?.id;
              if (activeElementId) {
                const typeMap: Record<string, ElementType> = {
                  '1': 'scene-heading',
                  '2': 'action',
                  '3': 'character',
                  '4': 'dialogue',
                  '5': 'parenthetical',
                  '6': 'transition'
                };
                
                const newType = typeMap[e.key];
                onFormatChange(activeElementId, newType);

                // Add default text for transition
                if (newType === 'transition') {
                  const newElement = document.querySelector('.active-element');
                  if (newElement && newElement.textContent?.trim() === '') {
                    newElement.textContent = 'CUT TO:';
                    onChange(activeElementId, 'CUT TO:', newType);
                  }
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
