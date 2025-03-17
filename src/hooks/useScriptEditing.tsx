
import { useState } from 'react';
import { ScriptElement, ElementType, ScriptContent } from '@/lib/types';
import { generateUniqueId } from '@/lib/formatScript';
import { shouldAddContd } from '@/lib/characterUtils';

export function useScriptEditing(
  elements: ScriptElement[],
  setElements: React.Dispatch<React.SetStateAction<ScriptElement[]>>,
  activeElementId: string | null,
  setActiveElementId: React.Dispatch<React.SetStateAction<string | null>>
) {
  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    const currentElement = elements[currentIndex];
    
    if (shiftKey && currentElement.type === 'dialogue') {
      const updatedElements = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
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
    
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: nextType,
      text: ''
    };
    
    if (nextType === 'character' as ElementType) {
      let prevCharIndex = -1;
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (elements[i].type === 'character') {
          prevCharIndex = i;
          break;
        }
      }
      
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

  const handleNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };

  const handleFormatChange = (id: string, newType: ElementType) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === id ? { ...element, type: newType } : element
      )
    );
  };

  const handleTagsChange = (elementId: string, tags: string[]) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, tags } : element
      )
    );
  };

  return {
    handleEnterKey,
    handleNavigate,
    handleFormatChange,
    handleTagsChange
  };
}
