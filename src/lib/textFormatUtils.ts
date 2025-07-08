import { ElementType } from './types';

// Enhanced Auto-format text based on element type
export const formatTextForElementType = (text: string, type: ElementType): string => {
  // Trim whitespace first
  const trimmedText = text.trim();

  switch (type) {
    case 'scene-heading':
    case 'transition':
      // Ensure INT./EXT. prefixes for scene headings if missing?
      // For now, just uppercase
      return trimmedText.toUpperCase();
    case 'character':
      // Uppercase the base name, preserve (CONT'D) case
      const contdMatch = trimmedText.match(/^(.*?)(\s*\(CONT'D\))?$/i);
      if (contdMatch && contdMatch[1]) {
        const baseName = contdMatch[1].trim().toUpperCase();
        const contdSuffix = contdMatch[2] || ''; // Preserve original case of (CONT'D) if present
        return `${baseName}${contdSuffix}`;
      }
      return trimmedText.toUpperCase(); // Fallback if regex fails
    case 'parenthetical':
      // Ensure it's wrapped in parentheses
      if (trimmedText.startsWith('(') && trimmedText.endsWith(')')) {
        return trimmedText; // Already wrapped
      }
      // Wrap the text, handle cases where it might already have one parenthesis
      const coreText = trimmedText.replace(/^\(|\)$/g, ''); // Remove existing parenthesis
      return `(${coreText})`;
    case 'action':
    case 'dialogue':
    case 'note':
    default:
      // No specific formatting for these types, just return trimmed text
      return trimmedText;
  }
};