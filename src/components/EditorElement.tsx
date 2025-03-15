import { useState, useRef, useEffect } from 'react';
import { ScriptElement, ElementType } from '../lib/types';
import { formatScriptElement, detectElementType } from '../lib/formatScript';

interface EditorElementProps {
  element: ScriptElement;
  previousElementType?: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  isActive: boolean;
  onFocus: () => void;
}

const EditorElement = ({ 
  element, 
  previousElementType, 
  onChange, 
  onKeyDown, 
  isActive,
  onFocus
}: EditorElementProps) => {
  const [text, setText] = useState(element.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [elementType, setElementType] = useState<ElementType>(element.type);

  // Focus on this element if it's active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  // Update local state when element type changes from outside
  useEffect(() => {
    setElementType(element.type);
  }, [element.type]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Auto-detect element type based on content
    const detectedType = detectElementType(newText, previousElementType);
    
    // Update element type in parent component
    onChange(element.id, newText, detectedType);
  };

  // Handle keyboard events for cursor navigation
  const handleKeyboardEvent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    // Allow normal browser behavior for arrow keys within the textarea
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const { selectionStart, value } = textarea;
      const lines = value.split('\n');
      
      // Calculate current cursor position
      let cursorLineIndex = 0;
      let charCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (charCount <= selectionStart && selectionStart <= charCount + lines[i].length) {
          cursorLineIndex = i;
          break;
        }
        // Add line length plus newline character
        charCount += lines[i].length + 1;
      }
      
      // Only pass arrow key events to parent when we've reached the boundaries
      if ((e.key === 'ArrowUp' && cursorLineIndex === 0 && selectionStart === 0) || 
          (e.key === 'ArrowDown' && cursorLineIndex === lines.length - 1 && 
           selectionStart === charCount - 1)) {
        onKeyDown(e, element.id);
        e.preventDefault(); // Prevent default browser behavior only at boundaries
      }
      // Otherwise let the browser handle normal navigation
      return;
    }
    
    // For Enter key, always pass to EditorKeyboardHandler for processing
    if (e.key === 'Enter') {
      onKeyDown(e, element.id);
      return;
    }
    
    // For Tab key, always pass to parent
    if (e.key === 'Tab') {
      onKeyDown(e, element.id);
      return;
    }
    
    // For other keys with modifiers (Ctrl/Cmd), pass to parent handler
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === '1' || e.key === '2' || e.key === '3' || 
         e.key === '4' || e.key === '6')) {
      onKeyDown(e, element.id);
      return;
    }
    
    // For all other keys, let the browser handle normal input
  };

  // Adjust textarea height to content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Apply appropriate class based on element type
  const getElementClass = () => {
    return `${elementType} element-container`;
  };

  // Set the text alignment based on element type
  const getTextAlignment = (): 'left' | 'center' | 'right' => {
    switch (elementType) {
      case 'character':
      case 'parenthetical':
        return 'center';
      case 'transition':
        return 'right';
      case 'dialogue':
        return 'center';
      default:
        return 'left';
    }
  };

  return (
    <div className={getElementClass()}>
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyboardEvent}
        onFocus={onFocus}
        className="w-full bg-transparent resize-none outline-none"
        placeholder={getPlaceholderText(elementType)}
        rows={1}
        style={{ 
          fontFamily: 'Courier Prime, monospace',
          caretColor: '#1E293B',
          textAlign: getTextAlignment(),
          lineHeight: 1.2,
          minHeight: '1.2em'
        }}
      />
    </div>
  );
};

function getPlaceholderText(type: ElementType): string {
  switch (type) {
    case 'scene-heading':
      return 'INT/EXT. LOCATION - TIME OF DAY (Ctrl+1)';
    case 'action':
      return 'Describe the action... (Ctrl+2)';
    case 'character':
      return 'CHARACTER NAME (Ctrl+3)';
    case 'dialogue':
      return 'Character dialogue... (Ctrl+4)';
    case 'parenthetical':
      return '(action)';
    case 'transition':
      return 'TRANSITION TO: (Ctrl+6)';
    case 'note':
      return 'Note to self...';
    default:
      return '';
  }
}

export default EditorElement;
