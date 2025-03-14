
import { useState, useEffect } from 'react';
import { ScriptContent, ScriptElement, ElementType } from '../lib/types';
import EditorElement from './EditorElement';
import { generateUniqueId } from '../lib/formatScript';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
}

const ScriptEditor = ({ initialContent, onChange }: ScriptEditorProps) => {
  const [elements, setElements] = useState<ScriptElement[]>(initialContent.elements);
  const [activeElementId, setActiveElementId] = useState<string | null>(elements[0]?.id || null);

  // Update parent with changes
  useEffect(() => {
    onChange({ elements });
  }, [elements, onChange]);

  const handleElementChange = (id: string, text: string, type: ElementType) => {
    setElements(prevElements => 
      prevElements.map(element => 
        element.id === id ? { ...element, text, type } : element
      )
    );
  };

  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index <= 0) return undefined;
    return elements[index - 1].type;
  };

  const addNewElement = (afterId: string) => {
    const afterIndex = elements.findIndex(element => element.id === afterId);
    
    // Determine type based on previous element
    let newType: ElementType = 'action';
    const previousType = elements[afterIndex]?.type;
    
    if (previousType === 'scene-heading') {
      newType = 'action';
    } else if (previousType === 'character') {
      newType = 'dialogue';
    } else if (previousType === 'action') {
      newType = 'action';
    } else if (previousType === 'dialogue' || previousType === 'parenthetical') {
      newType = 'action';
    }
    
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: newType,
      text: ''
    };
    
    const newElements = [
      ...elements.slice(0, afterIndex + 1),
      newElement,
      ...elements.slice(afterIndex + 1)
    ];
    
    setElements(newElements);
    setActiveElementId(newElement.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    // Enter key to add new element
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNewElement(id);
    }
    
    // Tab key to change formatting
    if (e.key === 'Tab') {
      e.preventDefault();
      const elementIndex = elements.findIndex(element => element.id === id);
      const element = elements[elementIndex];
      
      let newType: ElementType = 'action';
      
      // Cycle through element types
      if (element.type === 'action') {
        newType = 'character';
      } else if (element.type === 'character') {
        newType = 'scene-heading';
      } else if (element.type === 'scene-heading') {
        newType = 'transition';
      } else if (element.type === 'transition') {
        newType = 'action';
      }
      
      handleElementChange(id, element.text, newType);
    }
  };

  return (
    <div className="script-page">
      {elements.map((element, index) => (
        <EditorElement
          key={element.id}
          element={element}
          previousElementType={getPreviousElementType(index)}
          onChange={handleElementChange}
          onKeyDown={handleKeyDown}
          isActive={activeElementId === element.id}
          onFocus={() => setActiveElementId(element.id)}
        />
      ))}
    </div>
  );
};

export default ScriptEditor;
