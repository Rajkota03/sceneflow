
import { ElementType, ScriptElement } from "@/lib/types";
import { shouldAddContd } from "@/lib/characterUtils"; // This might need refinement or replacement
import { generateUniqueId, formatTextForElementType } from "@/lib/formatScript";

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

    let targetIndex = -1;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      targetIndex = currentIndex + 1;
    }

    if (targetIndex !== -1) {
      setActiveElementId(elements[targetIndex].id);
      // Scroll the target element into view after a short delay to ensure it's rendered
      setTimeout(() => {
          const targetElement = document.getElementById(elements[targetIndex].id)?.querySelector('.element-text');
          targetElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  // Handle creating a new element when Enter key is pressed
  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;

    const currentElement = elements[currentIndex];

    // Handle shift+enter to create a line break within the current element (e.g., Dialogue, Action)
    if (shiftKey && (currentElement.type === 'dialogue' || currentElement.type === 'action')) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const cursorPosition = range.startOffset;
      const textNode = range.startContainer;

      // Ensure we are working with a text node within the contentEditable element
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

      const currentText = textNode.nodeValue || '';
      const textBeforeCursor = currentText.slice(0, cursorPosition);
      const textAfterCursor = currentText.slice(cursorPosition);

      // Update the text node directly
      textNode.nodeValue = textBeforeCursor + '\n' + textAfterCursor;

      // Update the state (important for persistence)
      const updatedElements = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        // Reconstruct the full text if the element has multiple text nodes (unlikely with current setup)
        text: (document.getElementById(currentElement.id)?.querySelector('.element-text') as HTMLElement)?.innerText || ''
      };
      setElements(updatedElements);

      // Set cursor position after the newline
      setTimeout(() => {
        range.setStart(textNode, cursorPosition + 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }, 0);

      return; // Stop further processing for Shift+Enter
    }

    // --- Determine the type and default text of the next element --- 
    let nextType: ElementType;
    let defaultText = '';

    switch (currentElement.type) {
      case 'scene-heading':
        nextType = 'action';
        break;
      case 'action':
        // If action is empty, default to Character, otherwise Action.
        nextType = currentElement.text.trim() === '' ? 'character' : 'action';
        break;
      case 'character':
        nextType = 'dialogue';
        break;
      case 'dialogue':
        // Default to Character after dialogue.
        nextType = 'character';
        break;
      case 'parenthetical':
        // Always Dialogue after parenthetical.
        nextType = 'dialogue';
        break;
      case 'transition':
        // Always Scene Heading after transition.
        nextType = 'scene-heading';
        defaultText = 'INT. '; // Start with INT.
        break;
      default:
        nextType = 'action'; // Default fallback
    }

    console.log(`Creating new element of type: ${nextType} after element type: ${currentElement.type}`);

    // Create the new element
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: nextType,
      text: defaultText
    };

    // --- Smart Continuation Logic for Character --- 
    if (newElement.type === 'character') {
      let lastCharacterElement: ScriptElement | null = null;
      let sceneBreakFound = false;

      // Look backwards from the current element
      for (let i = currentIndex; i >= 0; i--) {
        const el = elements[i];
        if (el.type === 'character') {
          lastCharacterElement = el;
          break; // Found the most recent character
        }
        // Stop if we hit a scene break
        if (el.type === 'scene-heading' || el.type === 'transition') {
          sceneBreakFound = true;
          break;
        }
      }

      // Add (CONT'D) only if we found a previous character in the same scene
      if (lastCharacterElement && !sceneBreakFound) {
        const baseName = lastCharacterElement.text.replace(/\s*\(CONT'D\)\s*$/i, '').trim();
        // Only add CONT'D if the new character element immediately follows dialogue/paren from the *same* character
        if (currentElement.type === 'dialogue' || currentElement.type === 'parenthetical') {
             newElement.text = `${baseName} (CONT'D)`;
        } else {
            // If following action, just repeat the character name without CONT'D
            newElement.text = baseName;
        }
      } else if (currentElement.type === 'action' && currentElement.text.trim() === '') {
         // If coming from an empty action, leave the character name blank
         newElement.text = '';
      }
      // Otherwise, newElement.text remains empty (or defaultText if set earlier)
    }

    // Format the default or generated text based on the new element's type
    newElement.text = formatTextForElementType(newElement.text, newElement.type);

    // Insert the new element
    const updatedElements: ScriptElement[] = [
      ...elements.slice(0, currentIndex + 1),
      newElement,
      ...elements.slice(currentIndex + 1)
    ];

    setElements(updatedElements);
    setActiveElementId(newElement.id);

    // Scroll the new element into view
    setTimeout(() => {
      const newElementDOM = document.getElementById(newElement.id)?.querySelector('.element-text');
      newElementDOM?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  return {
    handleNavigate,
    handleEnterKey
  };
}

export default useScriptNavigation;

