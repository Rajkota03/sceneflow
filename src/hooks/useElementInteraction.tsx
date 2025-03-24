
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
  
  // Update local text state when prop changes
  useEffect(() => {
    setText(initialText);
    if (editorRef.current && editorRef.current.innerText !== initialText) {
      editorRef.current.innerText = initialText;
    }
  }, [initialText]);
  
  // Handle change events from the contentEditable div
  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const newText = e.currentTarget.innerText || '';
    
    // Update local text state and propagate changes to parent
    setText(newText);
    onChange(elementId, newText, type);
    
    // Check for character name suggestions
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

  // Handle keyboard navigation and special keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Only prevent backspace if text is empty to allow deletion otherwise
    if (e.key === 'Backspace' && text.trim() === '') {
      e.preventDefault();
      onNavigate('up', elementId);
      return;
    }
    
    // Handle formatting keyboard shortcuts
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
          // Auto-add "CUT TO:" for empty transitions
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
      e.stopPropagation();
      onEnterKey(elementId, e.shiftKey);
      return;
    }
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowUp') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        // Use arrows to navigate suggestions when they're visible
        e.preventDefault();
        setFocusIndex(prevIndex => Math.max(0, prevIndex - 1));
      } else {
        // Get selection position
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        
        // Only navigate if we're at the start of the text
        if (range && range.startOffset === 0 && range.collapsed) {
          e.preventDefault();
          onNavigate('up', elementId);
        }
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        // Use arrows to navigate suggestions when they're visible
        e.preventDefault();
        setFocusIndex(prevIndex => Math.min(filteredSuggestions.length - 1, prevIndex + 1));
      } else {
        // Get selection position
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        const textLength = editorRef.current?.innerText.length || 0;
        
        // Only navigate if we're at the end of the text
        if (range && range.endOffset === textLength && range.collapsed) {
          e.preventDefault();
          onNavigate('down', elementId);
        }
      }
      return;
    }
    
    // Handle Tab for element type cycling
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        // Use Tab to select a suggestion when they're visible
        handleSelectCharacter(filteredSuggestions[focusIndex]);
      } else if (type === 'dialogue') {
        // Convert dialogue to parenthetical on Tab
        onFormatChange(elementId, 'parenthetical');
        if (!text.startsWith('(') && !text.endsWith(')')) {
          const newText = `(${text})`;
          setText(newText);
          onChange(elementId, newText, 'parenthetical');
        }
      } else {
        // Cycle through element types
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
      return;
    }
  };

  // Handle character selection from suggestions
  const handleSelectCharacter = (name: string) => {
    if (editorRef.current) {
      editorRef.current.innerText = name;
      setText(name);
      onChange(elementId, name, type);
      setSuggestionsVisible(false);
    }
  };

  // Handle right-click to show element type menu
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowElementMenu(!showElementMenu);
  };

  // Handle element type change
  const handleElementTypeChange = (newType: ElementType) => {
    onFormatChange(elementId, newType);
    setShowElementMenu(false);
  };

  // Handle blur events
  const handleBlur = (e: React.FocusEvent) => {
    // Don't hide menus immediately to allow clicks to register
    setTimeout(() => {
      if (!editorRef.current?.contains(document.activeElement)) {
        setShowElementMenu(false);
        setSuggestionsVisible(false);
      }
    }, 100);
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
