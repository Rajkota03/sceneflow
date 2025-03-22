
import { ElementType } from '@/lib/types';

// Final Draft standard margins (in inches)
export const FINAL_DRAFT_MARGINS = {
  sceneHeading: { left: '1.5in', right: '1in' },
  action: { left: '1.5in', right: '1in' },
  character: { left: '3.5in', right: '1in' },
  dialogue: { left: '2.5in', right: '2.5in' },
  parenthetical: { left: '3in', right: '3in' },
  transition: { left: '1in', right: '1in' }
};

// Maps element types to Tailwind classes for rendering
export const renderStyle = (type: ElementType) => {
  switch (type) {
    case 'scene-heading':
      return 'font-bold uppercase mb-4';
    case 'action':
      return 'mb-4';
    case 'character':
      return 'font-bold uppercase mb-1 text-center';
    case 'dialogue':
      return 'mb-4';
    case 'parenthetical':
      return 'italic mb-1';
    case 'transition':
      return 'text-right font-bold uppercase mb-4';
    case 'note':
      return 'text-sm italic text-gray-500 mb-2';
    default:
      return 'mb-4';
  }
};

// Get standard CSS styles for each element type
export const getElementStyles = (type: ElementType): React.CSSProperties => {
  // Base styles
  const baseStyles: React.CSSProperties = {
    fontFamily: '"Courier Prime", monospace',
    fontSize: '12pt',
    lineHeight: 1.2,
    marginBottom: '1em',
    width: '100%',
    textAlign: 'left'
  };
  
  // Add element-specific styles
  switch (type) {
    case 'scene-heading':
      return {
        ...baseStyles,
        marginLeft: FINAL_DRAFT_MARGINS.sceneHeading.left,
        marginRight: FINAL_DRAFT_MARGINS.sceneHeading.right,
        fontWeight: 'bold',
        textTransform: 'uppercase'
      };
    case 'action':
      return {
        ...baseStyles,
        marginLeft: FINAL_DRAFT_MARGINS.action.left,
        marginRight: FINAL_DRAFT_MARGINS.action.right
      };
    case 'character':
      return {
        ...baseStyles,
        marginLeft: FINAL_DRAFT_MARGINS.character.left,
        marginRight: FINAL_DRAFT_MARGINS.character.right,
        fontWeight: 'bold',
        textTransform: 'uppercase'
      };
    case 'dialogue':
      return {
        ...baseStyles,
        marginLeft: FINAL_DRAFT_MARGINS.dialogue.left,
        marginRight: FINAL_DRAFT_MARGINS.dialogue.right
      };
    case 'parenthetical':
      return {
        ...baseStyles,
        marginLeft: FINAL_DRAFT_MARGINS.parenthetical.left,
        marginRight: FINAL_DRAFT_MARGINS.parenthetical.right,
        fontStyle: 'italic'
      };
    case 'transition':
      return {
        ...baseStyles,
        marginLeft: FINAL_DRAFT_MARGINS.transition.left,
        marginRight: FINAL_DRAFT_MARGINS.transition.right,
        textAlign: 'right',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      };
    case 'note':
      return {
        ...baseStyles,
        fontStyle: 'italic',
        fontSize: '10pt',
        color: '#888888'
      };
    default:
      return baseStyles;
  }
};

// Simple page count estimation
export const calculatePages = (elements: any[]): number => {
  // Average screenplay page has ~54 lines
  const LINES_PER_PAGE = 54;
  
  // Estimate line count for each element type
  const estimateLines = (element: any): number => {
    const text = element.text || '';
    const chars = text.length;
    
    // Estimate based on element type and character count
    switch (element.type) {
      case 'scene-heading':
        return 1 + Math.floor(chars / 60); // Scene headings often have one extra line
      case 'character':
        return 1; // Character names are single line
      case 'dialogue':
        // Dialogue has narrower margins, so fewer characters per line
        return Math.max(1, Math.ceil(chars / 40));
      case 'parenthetical':
        return 1; // Parentheticals are usually single line
      case 'transition':
        return 2; // Transitions take up a line plus space
      default: // action, etc.
        return Math.max(1, Math.ceil(chars / 60));
    }
  };
  
  // Calculate total estimated lines
  const totalLines = elements.reduce((sum, element) => sum + estimateLines(element), 0);
  
  // Return estimated page count (minimum of 1)
  return Math.max(1, Math.ceil(totalLines / LINES_PER_PAGE));
};
