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

  const shouldAddContd = (characterName: string, index: number): boolean => {
    if (index <= 0) return false;
    
    let lastCharacterIndex = -1;
    let hasActionBetween = false;
    
    for (let i = index - 1; i >= 0; i--) {
      if (elements[i].type === 'character') {
        lastCharacterIndex = i;
        break;
      }
    }
    
    if (lastCharacterIndex === -1) return false;
    
    for (let i = lastCharacterIndex + 1; i < index; i++) {
      if (elements[i].type === 'action') {
        hasActionBetween = true;
      } else if (elements[i].type === 'character' && elements[i].text !== characterName) {
        return false;
      }
    }
    
    return elements[lastCharacterIndex].text === characterName && hasActionBetween;
  };

  const processCharacterName = (text: string, index: number): string => {
    const cleanName = text.replace(/\s*\(CONT'D\)\s*$/, '');
    
    if (shouldAddContd(cleanName, index)) {
      return `${cleanName} (CONT'D)`;
    }
    
    return cleanName;
  };

  const addNewElement = (afterId: string, explicitType?: ElementType) => {
    const afterIndex = elements.findIndex(element => element.id === afterId);
    const currentElement = elements[afterIndex];
    
    let newType: ElementType = explicitType || 'action';
    let initialText = '';
    
    if (!explicitType) {
      if (currentElement.type === 'scene-heading') {
        newType = 'action';
      } else if (currentElement.type === 'character') {
        newType = 'dialogue';
      } else if (currentElement.type === 'dialogue' || currentElement.type === 'parenthetical') {
        newType = 'action';
      } else if (currentElement.type === 'action') {
        newType = 'action';
      } else if (currentElement.type === 'transition') {
        newType = 'scene-heading';
      }
    }
    
    if (newType === 'character' && afterIndex > 0) {
      const prevCharacterIndex = afterIndex;
      if (elements[prevCharacterIndex].type === 'character') {
        initialText = processCharacterName(elements[prevCharacterIndex].text, afterIndex + 1);
      }
    }
    
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: newType,
      text: initialText
    };
    
    const newElements = [
      ...elements.slice(0, afterIndex + 1),
      newElement,
      ...elements.slice(afterIndex + 1)
    ];
    
    setElements(newElements);
    setActiveElementId(newElement.id);
  };

  const changeElementType = (id: string, newType: ElementType) => {
    setElements(prevElements => {
      const elementIndex = prevElements.findIndex(element => element.id === id);
      if (elementIndex === -1) return prevElements;
      
      return prevElements.map((element, index) => {
        if (element.id === id) {
          let newText = element.text;
          if (newType === 'character') {
            newText = processCharacterName(newText, elementIndex);
          }
          return { ...element, type: newType, text: newText };
        }
        return element;
      });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    const elementIndex = elements.findIndex(element => element.id === id);
    const currentElement = elements[elementIndex];
    
    if (e.key === 'Enter') {
      if (e.shiftKey && currentElement.type === 'dialogue') {
        e.preventDefault();
        const newText = currentElement.text + '\n';
        handleElementChange(id, newText, currentElement.type);
      } else {
        e.preventDefault();
        
        let nextType: ElementType | undefined = undefined;
        
        if (currentElement.type === 'scene-heading') {
          nextType = 'action';
        } else if (currentElement.type === 'character') {
          nextType = 'dialogue';
        } else if (currentElement.type === 'dialogue' || currentElement.type === 'parenthetical') {
          nextType = 'action';
        }
        
        addNewElement(id, nextType);
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      
      let newType: ElementType = 'action';
      
      if (currentElement.type === 'action') {
        newType = 'character';
      } else if (currentElement.type === 'character') {
        newType = 'scene-heading';
      } else if (currentElement.type === 'scene-heading') {
        newType = 'transition';
      } else if (currentElement.type === 'transition') {
        newType = 'action';
      }
      
      changeElementType(id, newType);
    }
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          changeElementType(id, 'scene-heading');
          break;
        case '2':
          e.preventDefault();
          changeElementType(id, 'action');
          break;
        case '3':
          e.preventDefault();
          changeElementType(id, 'character');
          break;
        case '4':
          e.preventDefault();
          changeElementType(id, 'dialogue');
          break;
        case '6':
          e.preventDefault();
          changeElementType(id, 'transition');
          break;
      }
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
