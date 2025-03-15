
import { ElementType } from './types';

export function detectElementType(text: string, previousElementType?: ElementType): ElementType {
  // Detect scene headings (INT./EXT.)
  if (/^(INT|EXT|INT\/EXT|I\/E)[\s\.]/.test(text.toUpperCase())) {
    return 'scene-heading';
  }
  
  // Detect transitions (TO:)
  if (/^[A-Z\s]+TO:$/.test(text)) {
    return 'transition';
  }
  
  // Detect character names (ALL CAPS) - ignoring (CONT'D)
  if (/^[A-Z][A-Z\s']+(\s*\(CONT'D\))?$/.test(text) && 
      previousElementType !== 'character') {
    return 'character';
  }
  
  // Detect parentheticals
  if (/^\(.+\)$/.test(text)) {
    return 'parenthetical';
  }
  
  // If the previous element was a character or parenthetical, treat this as dialogue
  if (previousElementType === 'character' || 
      previousElementType === 'parenthetical' || 
      previousElementType === 'dialogue') {
    return 'dialogue';
  }
  
  // Default to action
  return 'action';
}

export function formatScriptElement(element: { type: ElementType; text: string }): string {
  switch (element.type) {
    case 'scene-heading':
      return element.text.toUpperCase();
    case 'character':
      // Preserve (CONT'D) if it exists
      const match = element.text.match(/^(.+?)(\s*\(CONT'D\))?$/);
      if (match && match[1]) {
        return `${match[1].toUpperCase()}${match[2] || ''}`;
      }
      return element.text.toUpperCase();
    case 'transition':
      return element.text.toUpperCase();
    default:
      return element.text;
  }
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Add the formatType function that was missing
export function formatType(type: ElementType): string {
  switch (type) {
    case 'scene-heading':
      return 'Scene Heading';
    case 'action':
      return 'Action';
    case 'character':
      return 'Character';
    case 'dialogue':
      return 'Dialogue';
    case 'parenthetical':
      return 'Parenthetical';
    case 'transition':
      return 'Transition';
    case 'note':
      return 'Note';
    default:
      return type;
  }
}
