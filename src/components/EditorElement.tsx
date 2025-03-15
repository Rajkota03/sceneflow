
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

  // Handle keyboard events for cursor navigation
  const handleKeyboardEvent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    // Get the current state of the textarea
    const { selectionStart, value } = textarea;
    const lines = value.split('\n');
    
    // Check if cursor is at the beginning or end of the text
    const isAtBeginning = selectionStart === 0;
    const isAtEnd = selectionStart === value.length;
    
    // Calculate current line position
    let currentLine = 0;
    let currentLineStart = 0;
    let currentLineEnd = 0;
    let charCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length;
      if (charCount <= selectionStart && selectionStart <= charCount + lineLength) {
        currentLine = i;
        currentLineStart = charCount;
        currentLineEnd = charCount + lineLength;
        break;
      }
      // Add line length plus newline character
      charCount += lineLength + 1;
    }
    
    const isAtFirstLine = currentLine === 0;
    const isAtLastLine = currentLine === lines.length - 1;
    const isAtLineStart = selectionStart === currentLineStart;
    const isAtLineEnd = selectionStart === currentLineEnd;
    
    if (e.key === 'ArrowUp' && isAtFirstLine) {
      // Only pass up arrow event to parent if at the first line
      onKeyDown(e, element.id);
      return;
    }
    
    if (e.key === 'ArrowDown' && isAtLastLine) {
      // Only pass down arrow event to parent if at the last line
      onKeyDown(e, element.id);
      return;
    }
    
    if (e.key === 'Enter') {
      // Always pass Enter key to parent for proper handling
      onKeyDown(e, element.id);
      return;
    }
    
    // For all other non-navigation keys, pass to parent handler
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && 
        e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      onKeyDown(e, element.id);
    }
    
    // For other arrow keys, let the browser handle normal cursor movement
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
