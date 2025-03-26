
import { ElementType, ScriptElement } from "@/lib/types";
import { shouldAddContd } from "@/lib/characterUtils";
import { generateUniqueId } from "@/lib/formatScript";

interface UseScriptNavigationProps {
  elements: ScriptElement[];
  setElements: React.Dispatch<React.SetStateAction<ScriptElement[]>>;
  activeElementId: string | null;
  setActiveElementId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useScriptNavigation({
  elements,
  setElements,
  activeElementId,
  setActiveElementId
}: UseScriptNavigationProps) {
  const handleNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };

  // Handle creating a new element when Enter key is pressed
  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    const currentElement = elements[currentIndex];
    
    // Handle shift+enter to create a line break within the current element
    if (shiftKey && currentElement.type === 'dialogue') {
      const updatedElements: ScriptElement[] = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
    // Determine the type of the next element
    let nextType: ElementType;
    
    // Set default next type based on current element type
    switch (currentElement.type) {
      case 'scene-heading':
        nextType = 'action';
        break;
      case 'action':
        // IMPORTANT: When in action, ALWAYS follow with action
        nextType = 'action';
        break;
      case 'character':
        nextType = 'dialogue';
        break;
      case 'dialogue':
        // When in dialogue, pressing Enter goes to action
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
    
    // Create a new element with the determined type
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: nextType,
      text: ''
    };
    
    // Special case for character continuation
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
    
    // Insert the new element after the current one
    const updatedElements: ScriptElement[] = [
      ...elements.slice(0, currentIndex + 1),
      newElement,
      ...elements.slice(currentIndex + 1)
    ];
    
    setElements(updatedElements);
    setActiveElementId(newElement.id);
  };

  return {
    handleNavigate,
    handleEnterKey
  };
}

export default useScriptNavigation;
