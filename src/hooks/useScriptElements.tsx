
import { useState, useEffect } from 'react';
import { ScriptContent, ScriptElement, ElementType } from '../lib/types';
import { generateUniqueId } from '../lib/formatScript';
import { processCharacterName } from '../lib/characterUtils';

export function useScriptElements(
  initialContent: ScriptContent,
  onChange: (content: ScriptContent) => void
) {
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
        initialText = processCharacterName(elements[prevCharacterIndex].text, afterIndex + 1, elements);
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
    
    // Set focus to the new element
    setTimeout(() => {
      setActiveElementId(newElement.id);
    }, 0);
  };

  const changeElementType = (id: string, newType: ElementType) => {
    setElements(prevElements => {
      const elementIndex = prevElements.findIndex(element => element.id === id);
      if (elementIndex === -1) return prevElements;
      
      return prevElements.map((element, index) => {
        if (element.id === id) {
          let newText = element.text;
          if (newType === 'character') {
            newText = processCharacterName(newText, elementIndex, prevElements);
          }
          return { ...element, type: newType, text: newText };
        }
        return element;
      });
    });
  };

  return {
    elements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    addNewElement,
    changeElementType
  };
}

export default useScriptElements;
