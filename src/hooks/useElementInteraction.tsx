
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
  const [text, setText] = useState(initialText || '');
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [showElementMenu, setShowElementMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Sync text with initial value from props when it changes
  useEffect(() => {
    setText(initialText || '');
    
    // Update the inner text of the editor ref if it exists and doesn't match
    if (editorRef.current && editorRef.current.innerText !== initialText) {
      editorRef.current.innerText = initialText || '';
    }
  }, [initialText]);
  
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
    
    // Format shortcuts with Cmd/Ctrl - Final Draft standard keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case '1': // Scene Heading
          e.preventDefault();
          onFormatChange(elementId, 'scene-heading');
          if (text.trim() === '' || !/^(INT|EXT|I\/E)/i.test(text)) {
            const newText = text.trim() === '' ? 'INT. ' : `INT. ${text}`;
            setText(newText);
            onChange(elementId, newText, 'scene-heading');
          }
          return;
        case '2': // Action
          e.preventDefault();
          onFormatChange(elementId, 'action');
          return;
        case '3': // Character
          e.preventDefault();
          onFormatChange(elementId, 'character');
          // Auto-uppercase character name
          if (text.trim() !== '') {
            const newText = text.toUpperCase();
            setText(newText);
            onChange(elementId, newText, 'character');
          }
          return;
        case '4': // Dialogue
          e.preventDefault();
          onFormatChange(elementId, 'dialogue');
          return;
        case '5': // Parenthetical
          e.preventDefault();
          onFormatChange(elementId, 'parenthetical');
          // Auto-format parenthetical
          if (!text.startsWith('(') && !text.endsWith(')')) {
            const newText = `(${text})`;
            setText(newText);
            onChange(elementId, newText, 'parenthetical');
          }
          return;
        case '6': // Transition
          e.preventDefault();
          onFormatChange(elementId, 'transition');
          const newText = text.trim() === '' ? 'CUT TO:' : text.toUpperCase();
          setText(newText);
          onChange(elementId, newText, 'transition');
          return;
        default:
          break;
      }
      
      // Ctrl+Shift+R for transition (Final Draft standard)
      if (e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onFormatChange(elementId, 'transition');
        const newText = text.trim() === '' ? 'CUT TO:' : text.toUpperCase();
        setText(newText);
        onChange(elementId, newText, 'transition');
        return;
      }
    }

    // Handle Enter key - Final Draft navigation standard
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If Shift+Enter in dialogue, insert a new line instead of a new element
      if (e.shiftKey && type === 'dialogue') {
        const newText = text + '\n';
        setText(newText);
        onChange(elementId, newText, type);
      } else {
        onEnterKey(elementId, e.shiftKey);
      }
      return;
    } 
    
    // Handle arrow key navigation
    if (e.key === 'ArrowUp') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.max(0, prevIndex - 1));
      } else {
        const selection = window.getSelection();
        const isAtStart = selection && selection.anchorOffset === 0;
        
        if (isAtStart) {
          e.preventDefault();
          onNavigate('up', elementId);
        }
      }
      return;
    } 
    
    if (e.key === 'ArrowDown') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.min(filteredSuggestions.length - 1, prevIndex + 1));
      } else {
        const selection = window.getSelection();
        const isAtEnd = selection && 
                       editorRef.current && 
                       selection.anchorOffset === editorRef.current.textContent?.length;
        
        if (isAtEnd) {
          e.preventDefault();
          onNavigate('down', elementId);
        }
      }
      return;
    } 
    
    // Tab for character suggestions or element type cycling - Final Draft standard
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        handleSelectCharacter(filteredSuggestions[focusIndex]);
        return;
      }
      
      // Tab in dialogue creates a parenthetical - Final Draft standard
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
