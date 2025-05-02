import { ScriptElement, ElementType } from './types';

// Refined check if a character should have (CONT'D) added
export function shouldAddContd(
  characterName: string, // Base character name (uppercase, no CONT'D)
  currentIndex: number, // The index where the *new* character element will be inserted
  elements: ScriptElement[] // The array *before* inserting the new element
): boolean {
  if (currentIndex <= 0) return false; // Cannot continue if it's the first element

  // Look backwards from the insertion point (currentIndex - 1)
  for (let i = currentIndex - 1; i >= 0; i--) {
    const element = elements[i];

    // If we hit a scene break, the character cannot be continuing from before it
    if (element.type === 'scene-heading' || element.type === 'transition') {
      return false;
    }

    // If we find the *same* character name
    if (element.type === 'character') {
      const previousCharName = element.text.replace(/\s*\(CONT'D\)\s*$/i, '').trim().toUpperCase();
      if (previousCharName === characterName) {
        // Found the last instance of this character in the current scene.
        // Now, check if there was *any* non-dialogue/non-parenthetical element between the last instance and the current position.
        // Typically, only intervening 'action' requires CONT'D.
        let requiresContd = false;
        for (let j = i + 1; j < currentIndex; j++) {
          // Check if the element between the last character instance and the new one is Action
          if (elements[j].type === 'action') {
            requiresContd = true;
            break; // Found action, CONT'D is needed
          }
           // If we find dialogue or parenthetical, it means the speech wasn't interrupted by action
           if (elements[j].type === 'dialogue' || elements[j].type === 'parenthetical') {
               // Continue checking, maybe action comes later
           }
        }
        return requiresContd;
      } else {
        // Found a *different* character name before finding the same one in this scene.
        // This means the current character cannot be continuing.
        return false;
      }
    }
    // Ignore dialogue and parenthetical when searching backwards for the character name
    if (element.type === 'dialogue' || element.type === 'parenthetical') {
        continue;
    }

    // If we encounter action while searching backwards *before* finding the character, it doesn't necessarily mean CONT'D is needed.
    // We only care about action *between* the last instance of the character and the new one.
  }

  // If we scanned all the way back to the beginning or a scene break without finding the character, no CONT'D needed.
  return false;
}

// Process character name for (CONT'D) appropriately (Uses refined shouldAddContd)
export function processCharacterName(
  text: string,
  index: number, // Index where the element *will be* or *is*
  elements: ScriptElement[] // Current list of elements
): string {
  const cleanName = text.replace(/\s*\(CONT'D\)\s*$/i, '').trim();
  const upperName = cleanName.toUpperCase();

  // Pass the index and the *current* elements array to shouldAddContd
  if (shouldAddContd(upperName, index, elements)) {
    return `${upperName} (CONT'D)`;
  }

  return upperName;
}

// Add (CONT'D) to a character name when needed (Redundant? processCharacterName covers this)
// Kept for potential specific use cases, but might be removable.
export function addContdToCharacter(
  text: string,
  index: number,
  elements: ScriptElement[]
): string {
    return processCharacterName(text, index, elements);
}

// Detect if typed text matches start of existing character names for suggestions
export function detectCharacter(text: string, characterNames: string[]): boolean {
  if (!text || !characterNames.length) return false;
  const cleanText = text.trim().toLowerCase();
  // Only show suggestions if the typed text is shorter than a potential match
  return characterNames.some(name =>
    name.toLowerCase().startsWith(cleanText) && name.toLowerCase() !== cleanText
  );
}

