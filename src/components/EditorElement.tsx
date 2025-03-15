
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
    
    // If this element becomes a character, ensure it's immediately center-aligned
    if (element.type === 'character' && inputRef.current) {
      inputRef.current.style.textAlign = 'center';
    }
  }, [element.type]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Auto-detect element type based on content
    const detectedType = detectElementType(newText, previousElementType);
    
    // Update element type in parent component
    onChange(element.id, newText, detectedType);
  };

  // Handle keyboard events but don't interfere with normal cursor movement
  const handleKeyboardEvent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Let the browser handle standard arrow key navigation within the textarea
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Only pass the event to parent handler if we're at the boundaries of the textarea
      const textarea = inputRef.current;
      if (!textarea) return;
      
      const { selectionStart, selectionEnd, value } = textarea;
      const lines = value.split('\n');
      
      // Get current line position
      let currentLine = 0;
      let charCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1; // +1 for the newline character
        if (charCount > selectionStart) {
          currentLine = i;
          break;
        }
      }
      
      // Only pass event to parent if at the top or bottom of the text
      if (e.key === 'ArrowUp' && currentLine === 0) {
        onKeyDown(e, element.id);
      } else if (e.key === 'ArrowDown' && currentLine === lines.length - 1) {
        onKeyDown(e, element.id);
      }
      
      // In all other cases, let the browser handle normal cursor movement
      return;
    }
    
    // For all other keys, pass to parent handler
    onKeyDown(e, element.id);
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
    if (elementType === 'character' || elementType === 'parenthetical') {
      return 'center';
    } else if (elementType === 'transition') {
      return 'right';
    } else if (elementType === 'dialogue') {
      return 'center';
    }
    return 'left';
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
