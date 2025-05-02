
import { useState, useEffect, useCallback } from 'react';
import { ScriptContent, ScriptElement, ElementType } from '../lib/types';
// Corrected import: use formatScriptElement instead of formatTextForElementType
import { generateUniqueId, formatScriptElement } from '../lib/formatScript'; 
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

  // Update parent component whenever elements change
  useEffect(() => {
    onChange({ elements });
  }, [elements, onChange]);

  // Handle changes to an element's text or type
  const handleElementChange = useCallback((id: string, text: string, type: ElementType) => {
    setElements(prevElements =>
      prevElements.map(element => {
        if (element.id === id) {
          // Apply formatting based on type using the correct function
          const formattedText = formatScriptElement({ text, type }); // Use formatScriptElement
          return { ...element, text: formattedText, type };
        }
        return element;
      })
    );
  }, []);

  // Get the type of the element preceding the one at the given index
  const getPreviousElementType = useCallback((index: number): ElementType | undefined => {
    if (index <= 0 || index >= elements.length) return undefined;
    return elements[index - 1].type;
  }, [elements]);

  // Change the type of an existing element
  const changeElementType = useCallback((id: string, newType: ElementType) => {
    setElements(prevElements => {
      const elementIndex = prevElements.findIndex(element => element.id === id);
      if (elementIndex === -1) return prevElements;

      return prevElements.map((element, index) => {
        if (element.id === id) {
          // Format the existing text according to the new type using the correct function
          let newText = formatScriptElement({ text: element.text, type: newType }); // Use formatScriptElement

          // Add default text for transition if it becomes empty after formatting
          if (newType === 'transition' && newText.trim() === '') {
            newText = 'CUT TO:'; // Already uppercase due to formatScriptElement
          }

          // Re-process character name if changing *to* character type
          if (newType === 'character') {
             newText = processCharacterName(newText, elementIndex, prevElements);
          }

          return { ...element, type: newType, text: newText };
        }
        return element;
      });
    });
  }, []);

  return {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    changeElementType
  };
}

export default useScriptElements;

