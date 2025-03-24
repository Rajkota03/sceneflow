
import { useState, useEffect } from 'react';
import { ScriptContent, ScriptElement, ElementType } from '@/lib/types';
import { generateUniqueId } from '@/lib/formatScript';
import { processCharacterName } from '@/lib/characterUtils';

export function useScriptElements(
  initialContent: ScriptContent,
  onChange: (content: ScriptContent) => void
) {
  // Initialize elements from props or create an empty array
  const [elements, setElements] = useState<ScriptElement[]>(
    initialContent.elements || []
  );
  
  // Track which element is currently active/focused
  const [activeElementId, setActiveElementId] = useState<string | null>(
    elements.length > 0 ? elements[0].id : null
  );

  // When elements change, notify parent component
  useEffect(() => {
    onChange({ elements });
  }, [elements, onChange]);

  // Handle text changes in an element
  const handleElementChange = (id: string, text: string, type: ElementType) => {
    setElements(prevElements => 
      prevElements.map(element => {
        if (element.id === id) {
          let updatedText = text;
          
          // Auto-capitalize scene headings and character names
          if (type === 'scene-heading' || type === 'character') {
            updatedText = text.toUpperCase();
          }
          
          return { ...element, text: updatedText, type };
        }
        return element;
      })
    );
  };

  // Get the type of the previous element
  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index < 0 || !elements[index]) return undefined;
    return elements[index].type;
  };

  // Add a new element after the specified element
  const addNewElement = (afterId: string, explicitType?: ElementType) => {
    const afterIndex = elements.findIndex(element => element.id === afterId);
    
    if (afterIndex === -1) {
      console.error('Could not find element with id', afterId);
      return;
    }
    
    const currentElement = elements[afterIndex];
    
    // Determine the type of the new element based on the current one
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
    
    // If creating a character after another character, copy the name and check for (CONT'D)
    if (newType === 'character' && afterIndex > 0) {
      const prevCharacterIndex = elements.findIndex((el, i) => 
        i < afterIndex && el.type === 'character'
      );
      
      if (prevCharacterIndex !== -1) {
        initialText = processCharacterName(
          elements[prevCharacterIndex].text, 
          afterIndex + 1, 
          elements
        );
      }
    }
    
    // Create the new element
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: newType,
      text: initialText
    };
    
    // Insert the new element into the array
    const newElements = [
      ...elements.slice(0, afterIndex + 1),
      newElement,
      ...elements.slice(afterIndex + 1)
    ];
    
    setElements(newElements);
    
    // Set focus to the new element
    setActiveElementId(newElement.id);
  };

  // Change the type of an existing element
  const changeElementType = (id: string, newType: ElementType) => {
    setElements(prevElements => {
      const elementIndex = prevElements.findIndex(element => element.id === id);
      if (elementIndex === -1) return prevElements;
      
      return prevElements.map((element, index) => {
        if (element.id === id) {
          let newText = element.text;
          
          // Auto-capitalize scene headings and character names
          if (newType === 'scene-heading' || newType === 'character') {
            newText = newText.toUpperCase();
          }
          
          // Add parentheses for parentheticals if they don't exist
          if (newType === 'parenthetical' && !newText.startsWith('(') && !newText.endsWith(')')) {
            newText = `(${newText})`;
          }
          
          // Auto-add "CUT TO:" for empty transitions
          if (newType === 'transition' && newText.trim() === '') {
            newText = 'CUT TO:';
          }
          
          return { ...element, type: newType, text: newText };
        }
        return element;
      });
    });
  };

  return {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    addNewElement,
    changeElementType
  };
}

export default useScriptElements;
