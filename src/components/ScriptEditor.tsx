
import { useEffect, useRef, useState } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType } from '../lib/types';
import EditorElement from './EditorElement';
import { generateUniqueId } from '../lib/formatScript';
import FormatStyler from './FormatStyler';
import { useFormat } from '@/lib/formatContext';
import { addContdToCharacter, shouldAddContd } from '@/lib/characterUtils';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
}

const ScriptEditor = ({ initialContent, onChange, notes, onNoteCreate, className }: ScriptEditorProps) => {
  const { formatState } = useFormat();
  const [elements, setElements] = useState<ScriptElement[]>(initialContent.elements || []);
  const [activeElementId, setActiveElementId] = useState<string | null>(
    elements.length > 0 ? elements[0].id : null
  );
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync elements with parent component
  useEffect(() => {
    onChange({ elements });
  }, [elements, onChange]);

  // Create default elements if empty
  useEffect(() => {
    if (!elements || elements.length === 0) {
      console.log("No elements found, creating default elements");
      const defaultElements: ScriptElement[] = [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: generateUniqueId(),
          type: 'action',
          text: 'Type your action here...'
        }
      ];
      setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements]);

  // Get the previous element type for contextual formatting
  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index <= 0) return undefined;
    return elements[index - 1].type;
  };

  // Handle element text and type changes
  const handleElementChange = (id: string, text: string, type: ElementType) => {
    setElements(prevElements => 
      prevElements.map(element => 
        element.id === id ? { ...element, text, type } : element
      )
    );
  };

  // Handle element type changes (manual formatting)
  const handleFormatChange = (id: string, newType: ElementType) => {
    setElements(prevElements => {
      const index = prevElements.findIndex(el => el.id === id);
      if (index === -1) return prevElements;
      
      let updatedElements = [...prevElements];
      let updatedElement = { ...updatedElements[index], type: newType };
      
      // Add (CONT'D) when appropriate for character elements
      if (newType === 'character') {
        updatedElement.text = addContdToCharacter(updatedElement.text, index, prevElements);
      }
      
      updatedElements[index] = updatedElement;
      return updatedElements;
    });
  };

  // Handle Enter key press
  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    const currentElement = elements[currentIndex];
    
    // Handle Shift+Enter for dialogue (creates a line break instead of new element)
    if (shiftKey && currentElement.type === 'dialogue') {
      const updatedElements = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
    // Determine the next element's type based on screenplay logic
    let nextType: ElementType;
    switch (currentElement.type) {
      case 'scene-heading':
        nextType = 'action';
        break;
      case 'character':
        nextType = 'dialogue';
        break;
      case 'dialogue':
        nextType = 'action';
        break;
      case 'parenthetical':
        nextType = 'dialogue';
        break;
      case 'transition':
        nextType = 'scene-heading';
        break;
      default:
        nextType = 'action';
    }
    
    // Create a new element
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: nextType,
      text: ''
    };
    
    // Handle character continuation if this is a character after an action
    if (nextType === 'character' && currentIndex > 0) {
      // Find the previous character
      let prevCharIndex = -1;
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (elements[i].type === 'character') {
          prevCharIndex = i;
          break;
        }
      }
      
      // Check if we should add CONT'D
      if (prevCharIndex !== -1) {
        const charName = elements[prevCharIndex].text.replace(/\s*\(CONT'D\)\s*$/, '');
        if (shouldAddContd(charName, currentIndex + 1, [...elements, newElement])) {
          newElement.text = `${charName} (CONT'D)`;
        } else {
          newElement.text = charName;
        }
      }
    }
    
    const updatedElements = [
      ...elements.slice(0, currentIndex + 1),
      newElement,
      ...elements.slice(currentIndex + 1)
    ];
    
    setElements(updatedElements);
    setActiveElementId(newElement.id);
  };

  // Handle navigation between elements
  const handleNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };

  // Handle focus on element
  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  return (
    <div 
      className={`flex justify-center w-full h-full overflow-auto ${className || ''}`}
      ref={editorRef}
    >
      <FormatStyler>
        <div className="script-page" style={{ 
          transform: `scale(${formatState.zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out'
        }}>
          {elements.map((element, index) => (
            <EditorElement
              key={element.id}
              element={element}
              previousElementType={getPreviousElementType(index)}
              onChange={handleElementChange}
              onFocus={() => handleFocus(element.id)}
              isActive={activeElementId === element.id}
              onNavigate={handleNavigate}
              onEnterKey={handleEnterKey}
              onFormatChange={handleFormatChange}
            />
          ))}
        </div>
      </FormatStyler>
    </div>
  );
};

export default ScriptEditor;
