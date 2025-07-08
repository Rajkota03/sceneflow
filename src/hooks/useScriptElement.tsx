import { useState, useRef, useCallback, useEffect } from 'react';
import { ElementType } from '@/lib/types';

export interface ScriptElementData {
  id: string;
  type: ElementType;
  text: string;
}

interface UseScriptElementProps {
  element: ScriptElementData;
  onUpdate: (id: string, text: string, type: ElementType) => void;
  onNavigate: (direction: 'up' | 'down', currentId: string) => void;
  onEnter: (currentId: string, createAfter: boolean) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
}

export function useScriptElement({
  element,
  onUpdate,
  onNavigate,
  onEnter,
  onDelete,
  isActive
}: UseScriptElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [localText, setLocalText] = useState(element.text);

  // Sync with prop changes
  useEffect(() => {
    setLocalText(element.text);
  }, [element.text]);

  // Auto-detect element type based on content
  const detectElementType = useCallback((text: string): ElementType => {
    const trimmed = text.trim();
    
    if (!trimmed) return 'action';
    
    // Scene heading patterns
    if (/^(INT\.|EXT\.|EST\.|I\/E\.)/i.test(trimmed)) {
      return 'scene-heading';
    }
    
    // Character (all caps, short line, no periods)
    if (trimmed === trimmed.toUpperCase() && 
        trimmed.length < 30 && 
        !trimmed.includes('.') &&
        trimmed.length > 1) {
      return 'character';
    }
    
    // Parenthetical
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      return 'parenthetical';
    }
    
    // Transition patterns
    if (/^(FADE IN:|FADE OUT\.|CUT TO:|DISSOLVE TO:|SMASH CUT TO:)/i.test(trimmed)) {
      return 'transition';
    }
    
    // Default to dialogue if previous was character or parenthetical
    return 'action';
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || '';
    setLocalText(newText);
    
    // Auto-detect type and update
    const detectedType = detectElementType(newText);
    onUpdate(element.id, newText, detectedType);
  }, [element.id, detectElementType, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onEnter(element.id, !e.shiftKey);
        break;
        
      case 'ArrowUp':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onNavigate('up', element.id);
        }
        break;
        
      case 'ArrowDown':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onNavigate('down', element.id);
        }
        break;
        
      case 'Backspace':
        if (localText.trim() === '' && !e.shiftKey) {
          e.preventDefault();
          onDelete(element.id);
        }
        break;
        
      case 'Tab':
        e.preventDefault();
        // Convert to dialogue if action, or indent if already dialogue
        if (element.type === 'action') {
          onUpdate(element.id, localText, 'dialogue');
        }
        break;
    }
  }, [element.id, element.type, localText, onNavigate, onEnter, onDelete, onUpdate]);

  // Focus element when it becomes active
  useEffect(() => {
    if (isActive && elementRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (elementRef.current) {
          elementRef.current.focus();
          
          // Place cursor at end
          const selection = window.getSelection();
          if (selection) {
            try {
              const range = document.createRange();
              range.selectNodeContents(elementRef.current);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (error) {
              // Fallback: just focus the element
              console.warn('Could not set cursor position:', error);
            }
          }
        }
      });
    }
  }, [isActive]);

  return {
    elementRef,
    localText,
    handleInput,
    handleKeyDown
  };
}