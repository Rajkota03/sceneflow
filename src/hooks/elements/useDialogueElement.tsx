
import { useState, useRef, useEffect } from 'react';
import { ElementType, ScriptElement } from '@/lib/types';

interface UseDialogueElementProps {
  element: ScriptElement;
  onChange: (id: string, text: string, type: ElementType) => void;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  isActive: boolean;
}

export function useDialogueElement({
  element,
  onChange,
  onNavigate,
  onEnterKey,
  onFormatChange,
  isActive
}: UseDialogueElementProps) {
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
          onEnterKey(element.id, false);
          
          setTimeout(() => {
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

    // Special handling for shift+enter to create line breaks
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        e.preventDefault();
        // Insert actual line break in the text
        const selectionStart = window.getSelection()?.getRangeAt(0).startOffset || 0;
        const currentText = text;
        const newText = currentText.substring(0, selectionStart) + '\n' + currentText.substring(selectionStart);
        setText(newText);
        onChange(element.id, newText, element.type);
        
        // Update cursor position after line break
        setTimeout(() => {
          if (editorRef.current) {
            const range = document.createRange();
            const sel = window.getSelection();
            
            // Find the text node and position after the inserted line break
            let textNode: Node | null = null;
            let position = 0;
            let currentPos = 0;
            
            const findPosition = (node: Node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                const length = node.textContent?.length || 0;
                if (currentPos + length >= selectionStart + 1) {
                  textNode = node;
                  position = selectionStart + 1 - currentPos;
                  return true;
                }
                currentPos += length;
              } else {
                for (let i = 0; i < node.childNodes.length; i++) {
                  if (findPosition(node.childNodes[i])) {
                    return true;
                  }
                }
              }
              return false;
            };
            
            findPosition(editorRef.current);
            
            if (textNode && sel) {
              range.setStart(textNode, position);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        }, 0);
      } else {
        e.preventDefault();
        // When in dialogue, pressing Enter goes to action
        onEnterKey(element.id, false);
      }
    } else if (e.key === 'ArrowUp') {
      onNavigate('up', element.id);
    } else if (e.key === 'ArrowDown') {
      onNavigate('down', element.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      // Tab in dialogue converts to parenthetical
      onFormatChange(element.id, 'parenthetical');
      if (!text.startsWith('(') && !text.endsWith(')')) {
        const newText = `(${text})`;
        setText(newText);
        onChange(element.id, newText, 'parenthetical');
      }
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

export default useDialogueElement;
