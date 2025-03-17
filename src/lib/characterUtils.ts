import { ScriptElement, ElementType } from './types';

// Check if a character should have (CONT'D) added
export function shouldAddContd(
  characterName: string, 
  index: number, 
  elements: ScriptElement[]
): boolean {
  if (index <= 0) return false;
  
  // Find the last time this character spoke
  let lastCharacterIndex = -1;
  
  for (let i = index - 1; i >= 0; i--) {
    if (elements[i].type === 'character') {
      // Remove (CONT'D) if present for comparison
      const cleanName = elements[i].text.replace(/\s*\(CONT'D\)\s*$/, '');
      
      if (cleanName.toUpperCase() === characterName.toUpperCase()) {
        lastCharacterIndex = i;
        break;
      } else {
        // If another character spoke, no CONT'D
        return false;
      }
    }
  }
  
  if (lastCharacterIndex === -1) return false;
  
  // Check if there is action between the last time the character spoke and now
  let hasActionBetween = false;
  
  for (let i = lastCharacterIndex + 1; i < index; i++) {
    if (elements[i].type === 'action') {
      hasActionBetween = true;
      break;
    }
  }
  
  // Only add (CONT'D) if there's action between character speeches
  return hasActionBetween;
}

// Process character name for (CONT'D) appropriately
export function processCharacterName(
  text: string, 
  index: number, 
  elements: ScriptElement[]
): string {
  // Clean the name (remove any existing CONT'D)
  const cleanName = text.replace(/\s*\(CONT'D\)\s*$/, '').trim();
  
  // Make sure name is uppercase for screenplay format
  const upperName = cleanName.toUpperCase();
  
  // Add (CONT'D) if needed
  if (shouldAddContd(upperName, index, elements)) {
    return `${upperName} (CONT'D)`;
  }
  
  return upperName;
}

// Add (CONT'D) to a character name when needed
export function addContdToCharacter(
  text: string,
  index: number,
  elements: ScriptElement[]
): string {
  const cleanName = text.replace(/\s*\(CONT'D\)\s*$/, '').trim();
  
  if (shouldAddContd(cleanName, index, elements)) {
    return `${cleanName} (CONT'D)`;
  }
  
  return cleanName;
}

// Add the missing detectCharacter function
export function detectCharacter(text: string, characterNames: string[]): boolean {
  if (!text || !characterNames.length) return false;
  const cleanText = text.trim().toLowerCase();
  return characterNames.some(name => 
    name.toLowerCase().startsWith(cleanText) && name.toLowerCase() !== cleanText
  );
}
