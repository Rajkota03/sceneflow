
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
  
  // Sync text with initial value from props
  useEffect(() => {
    setText(initialText);
  }, [initialText]);
  
  // Focus management when element becomes active
  useEffect(() => {
    if (editorRef.current && isActive) {
      // Update the inner content to ensure it matches the text
      if (editorRef.current.innerText !== initialText) {
        editorRef.current.innerText = initialText;
      }
      
      // Focus the element when it becomes active
      editorRef.current.focus();
      
      // Position cursor at the end
      const range = document.createRange();
      const sel = window.getSelection();
      
      // Different handling based on whether there's content or not
      if (editorRef.current.childNodes.length > 0) {
        const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
        range.setStartAfter(lastNode);
      } else {
        range.setStart(editorRef.current, 0);
      }
      
      range.collapse(true);
      
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
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
    // Special handling for empty text with backspace
    if (e.key === 'Backspace' && text.trim() === '') {
      e.preventDefault();
      onNavigate('up', elementId);
      return;
    }
    
    // Format shortcuts with Cmd/Ctrl
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

    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterKey(elementId, e.shiftKey);
      return;
    } 
    
    // Handle arrow key navigation
    if (e.key === 'ArrowUp') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.max(0, prevIndex - 1));
      } else {
        e.preventDefault();
        onNavigate('up', elementId);
      }
      return;
    } 
    
    if (e.key === 'ArrowDown') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.min(filteredSuggestions.length - 1, prevIndex + 1));
      } else {
        e.preventDefault();
        onNavigate('down', elementId);
      }
      return;
    } 
    
    // Tab for character suggestions or element type cycling
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        handleSelectCharacter(filteredSuggestions[focusIndex]);
        return;
      }
      
      if (type === 'dialogue') {
        onFormatChange(elementId, 'parenthetical');
        if (!text.startsWith('(') && !text.endsWith(')')) {
          const newText = `(${text})`;
          setText(newText);
          onChange(elementId, newText, 'parenthetical');
        }
        return;
      }
      
      // Cycle through element types with Tab
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
