
import { ScriptElement, ElementType } from './types';

export function shouldAddContd(
  characterName: string, 
  index: number, 
  elements: ScriptElement[]
): boolean {
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
}

export function processCharacterName(
  text: string, 
  index: number, 
  elements: ScriptElement[]
): string {
  const cleanName = text.replace(/\s*\(CONT'D\)\s*$/, '');
  
  if (shouldAddContd(cleanName, index, elements)) {
    return `${cleanName} (CONT'D)`;
  }
  
  return cleanName;
}
