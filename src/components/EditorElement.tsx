
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
    if (elementType === 'character' || elementType === 'dialogue' || elementType === 'parenthetical') {
      return 'center';
    } else if (elementType === 'transition') {
      return 'right';
    }
    return 'left';
  };

  return (
    <div className={getElementClass()}>
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => onKeyDown(e, element.id)}
        onFocus={onFocus}
        className="w-full bg-transparent resize-none outline-none"
        placeholder={getPlaceholderText(elementType)}
        rows={1}
        style={{ 
          fontFamily: 'Courier Prime, monospace',
          caretColor: '#1E293B',
          textAlign: getTextAlignment()
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
