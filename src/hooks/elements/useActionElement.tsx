
import { useState, useRef, useEffect } from 'react';
import { ElementType, ScriptElement } from '@/lib/types';

interface UseActionElementProps {
  element: ScriptElement;
  onChange: (id: string, text: string, type: ElementType) => void;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  isActive: boolean;
}

export function useActionElement({
  element,
  onChange,
  onNavigate,
  onEnterKey,
  onFormatChange,
  isActive
}: UseActionElementProps) {
  const [text, setText] = useState(element.text);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showElementMenu, setShowElementMenu] = useState(false);
  
  useEffect(() => {
    setText(element.text);
  }, [element.text]);

  useEffect(() => {
    if (editorRef.current && isActive) {
      if (editorRef.current.innerText !== element.text) {
        editorRef.current.innerText = element.text;
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
  }, [isActive, element.text]);

  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    setText(newText);
    onChange(element.id, newText, element.type);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && text.trim() === '') {
      e.preventDefault();
      onNavigate('up', element.id);
      return;
    }
    
    // Handle keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          
          // Create new element then change its type
          const typeMap: Record<string, ElementType> = {
            '1': 'scene-heading',
            '2': 'action',
            '3': 'character',
            '4': 'dialogue',
            '5': 'parenthetical',
            '6': 'transition'
          };
          
          const newType = typeMap[e.key];
          onFormatChange(element.id, newType);
          return;
        
        default:
          break;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      console.log("Enter pressed in action element, creating new action element");
      // Action always followed by action when pressing Enter
      onEnterKey(element.id, e.shiftKey);
    } else if (e.key === 'ArrowUp') {
      onNavigate('up', element.id);
    } else if (e.key === 'ArrowDown') {
      onNavigate('down', element.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      // Cycle through element types
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
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowElementMenu(!showElementMenu);
  };

  const handleElementTypeChange = (newType: ElementType) => {
    onFormatChange(element.id, newType);
    setShowElementMenu(false);
  };

  return {
    text,
    editorRef,
    showElementMenu,
    handleChange,
    handleKeyDown,
    handleRightClick,
    handleElementTypeChange,
    setShowElementMenu
  };
}

export default useActionElement;
