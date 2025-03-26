import { useState, useEffect } from 'react';
import { ScriptContent, ScriptElement, ElementType } from '../lib/types';
import { generateUniqueId } from '../lib/formatScript';
import { processCharacterName } from '../lib/characterUtils';

export function useScriptElements(
  initialContent: ScriptContent,
  onChange: (content: ScriptContent) => void
) {
  console.log('useScriptElements initialized with', initialContent?.elements?.length || 0, 'elements');
  
  const [elements, setElements] = useState<ScriptElement[]>(initialContent.elements || []);
  const [activeElementId, setActiveElementId] = useState<string | null>(
    elements.length > 0 ? elements[0].id : null
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    console.log('Elements changed, notifying parent', elements.length);
    onChange({ elements });
  }, [elements, onChange]);

  const handleElementChange = (
    idOrElements: string | ScriptElement[], 
    text?: string, 
    type?: ElementType
  ) => {
    if (Array.isArray(idOrElements)) {
      console.log('Setting entire elements array', idOrElements.length);
      setElements(idOrElements);
      return;
    }
    
    if (typeof idOrElements === 'string' && idOrElements && type) {
      const id = idOrElements;
      console.log('Updating single element', id);
      
      setElements(prevElements => 
        prevElements.map(element => {
          if (element.id === id) {
            let updatedText = text || '';
            
            if (type === 'scene-heading' || type === 'character') {
              updatedText = updatedText.toUpperCase();
            }
            
            return { ...element, text: updatedText, type };
          }
          return element;
        })
      );
    } else if (typeof idOrElements === 'string' && text && text.startsWith('[')) {
      try {
        const parsedElements = JSON.parse(text);
        if (Array.isArray(parsedElements)) {
          console.log('Parsed elements array from JSON string', parsedElements.length);
          setElements(parsedElements);
        }
      } catch (e) {
        console.error('Failed to parse elements JSON:', e);
      }
    }
  };

  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index <= 0) return undefined;
    return elements[index - 1].type;
  };

  const addNewElement = (afterId: string, explicitType?: ElementType) => {
    const afterIndex = elements.findIndex(element => element.id === afterId);
    
    if (afterIndex === -1) {
      console.error('Could not find element with id', afterId);
      return;
    }
    
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
      text: initialText,
      page: currentPage
    };
    
    const newElements = [
      ...elements.slice(0, afterIndex + 1),
      newElement,
      ...elements.slice(afterIndex + 1)
    ];
    
    console.log('Adding new element after', afterId, 'new element:', newElement.id, newElement.type);
    setElements(newElements);
    
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
          
          if (newType === 'scene-heading' || newType === 'character') {
            newText = newText.toUpperCase();
          }
          
          return { ...element, type: newType, text: newText };
        }
        return element;
      });
    });
  };

  const updateCurrentPage = (elementId: string, pageNumber: number) => {
    if (activeElementId === elementId) {
      setCurrentPage(pageNumber);
    }
  };

  return {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    currentPage,
    handleElementChange,
    getPreviousElementType,
    addNewElement,
    changeElementType,
    updateCurrentPage
  };
}

export default useScriptElements;
