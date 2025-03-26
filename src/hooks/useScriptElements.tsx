
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
    onChange({ elements });
  }, [elements, onChange]);

  // Updated to handle array of elements directly from SlateEditor
  const handleElementChange = (
    idOrElements: string | ScriptElement[], 
    text?: string, 
    type?: ElementType
  ) => {
    // Handle direct array update from SlateEditor
    if (Array.isArray(idOrElements)) {
      setElements(idOrElements);
      return;
    }
    
    // Handle single element update (legacy support)
    const id = idOrElements;
    if (id && type) {
      setElements(prevElements => 
        prevElements.map(element => {
          if (element.id === id) {
            let updatedText = text || '';
            // Auto-capitalize scene headings and character names
            if (type === 'scene-heading' || type === 'character') {
              updatedText = updatedText.toUpperCase();
            }
            return { ...element, text: updatedText, type };
          }
          return element;
        })
      );
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
      page: currentPage // Assign current page to new element
    };
    
    const newElements = [
      ...elements.slice(0, afterIndex + 1),
      newElement,
      ...elements.slice(afterIndex + 1)
    ];
    
    console.log('Adding new element after', afterId, 'new element:', newElement.id, newElement.type);
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
          
          // Auto-capitalize scene headings and character names
          if (newType === 'scene-heading' || newType === 'character') {
            newText = newText.toUpperCase();
          }
          
          return { ...element, type: newType, text: newText };
        }
        return element;
      });
    });
  };

  // Update the current page based on active element
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
