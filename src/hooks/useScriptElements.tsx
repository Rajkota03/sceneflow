
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

  useEffect(() => {
    onChange({ elements });
  }, [elements, onChange]);

  const handleElementChange = (id: string, text: string, type: ElementType) => {
    setElements(prevElements => 
      prevElements.map(element => {
        if (element.id === id) {
          let updatedText = text;
          
          // Auto-formatting based on Final Draft rules
          if (type === 'scene-heading') {
            // Auto-capitalize scene headings
            updatedText = text.toUpperCase();
            
            // Auto-prefix INT./EXT. if not already present
            if (!/(INT|EXT|I\/E|INT\/EXT|INT\.\/EXT\.|INT\.EXT\.)[\s\.]/.test(updatedText) && 
                updatedText.trim() !== '' && 
                !updatedText.startsWith('INT') && 
                !updatedText.startsWith('EXT')) {
              updatedText = `INT. ${updatedText}`;
            }
          } else if (type === 'character') {
            // Auto-capitalize character names
            updatedText = text.toUpperCase();
          } else if (type === 'transition') {
            // Auto-capitalize transitions
            updatedText = text.toUpperCase();
            
            // Auto-append TO: if not already present and not empty
            if (!updatedText.endsWith('TO:') && updatedText.trim() !== '') {
              updatedText = `${updatedText.replace(/\s*TO:$/i, '')} TO:`;
            }
          }
          
          return { ...element, text: updatedText, type };
        }
        return element;
      })
    );
  };

  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index < 0) return undefined;
    return elements[index].type;
  };

  const addNewElement = (afterId: string, explicitType?: ElementType) => {
    const afterIndex = elements.findIndex(element => element.id === afterId);
    
    if (afterIndex === -1) {
      console.error('Could not find element with id', afterId);
      return;
    }
    
    const currentElement = elements[afterIndex];
    
    // Following Final Draft's intelligent element type flow
    let newType: ElementType = explicitType || 'action';
    let initialText = '';
    
    if (!explicitType) {
      // Auto-determine the next logical element type based on current element
      switch (currentElement.type) {
        case 'scene-heading':
          newType = 'action';
          break;
        case 'action':
          // After action often comes character or another action
          newType = 'action';
          break;
        case 'character':
          newType = 'dialogue';
          break;
        case 'dialogue':
          // After dialogue usually comes action or another character
          newType = 'action';
          break;
        case 'parenthetical':
          newType = 'dialogue';
          break;
        case 'transition':
          newType = 'scene-heading';
          // Provide a default scene heading starter
          initialText = 'INT. ';
          break;
        default:
          newType = 'action';
      }
    }
    
    // Handle character continuations (character appears again after dialogue)
    if (newType === 'character' && afterIndex > 0) {
      // Find the most recent character before this point
      const prevCharacterIndex = elements.slice(0, afterIndex + 1)
        .reverse()
        .findIndex(el => el.type === 'character');
      
      if (prevCharacterIndex !== -1) {
        const recentCharIdx = afterIndex - prevCharacterIndex;
        initialText = processCharacterName(elements[recentCharIdx].text, afterIndex + 1, elements);
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
          
          // Apply Final Draft auto-formatting rules when changing element types
          if (newType === 'scene-heading') {
            // Auto-prefix INT./EXT. if changing to scene heading
            if (!/(INT|EXT|I\/E|INT\/EXT)[\s\.]/.test(newText.toUpperCase()) && 
                newText.trim() !== '') {
              newText = `INT. ${newText}`;
            }
            newText = newText.toUpperCase();
          } else if (newType === 'character') {
            newText = processCharacterName(newText, elementIndex, prevElements);
            newText = newText.toUpperCase();
          } else if (newType === 'transition') {
            // Common transitions
            if (newText.trim() === '') {
              newText = 'CUT TO:';
            } else if (!newText.endsWith('TO:')) {
              newText = `${newText.replace(/\s*TO:$/i, '')} TO:`;
            }
            newText = newText.toUpperCase();
          } else if (newType === 'parenthetical') {
            // Ensure parentheticals have proper format
            if (!newText.startsWith('(') && !newText.endsWith(')')) {
              newText = `(${newText})`;
            }
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
