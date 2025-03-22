
import { ElementType } from '@/lib/types';

// Final Draft standard margins and positioning per the specs
export const FINAL_DRAFT_MARGINS = {
  sceneHeading: { left: '1.5in', right: '1in' },
  action: { left: '1.5in', right: '1in' },
  character: { left: '3.5in', right: '1in' },
  dialogue: { left: '2.5in', right: '2.5in' },
  parenthetical: { left: '3.0in', right: '2.9in' },
  transition: { left: '5.5in', right: '1in' }
};

// Maps element types to Tailwind classes for rendering
export const renderStyle = (type: ElementType, previousElementType?: ElementType) => {
  switch (type) {
    case 'scene-heading':
      return 'font-bold uppercase tracking-wide mb-4';
    case 'action':
      return 'mb-4';
    case 'character':
      return 'text-left font-bold uppercase mb-1';
    case 'dialogue':
      return 'mb-4';
    case 'parenthetical':
      return 'text-left italic mb-1';
    case 'transition':
      return 'text-right font-bold uppercase tracking-wide mb-4';
    case 'note':
      return 'text-sm italic text-gray-500 mb-2';
    default:
      return 'mb-4';
  }
};

// Get the proper CSS styles for each element type based on Final Draft standards
export const getElementStyles = (type: ElementType): React.CSSProperties => {
  // Base styles following Final Draft standards
  const baseStyles: React.CSSProperties = {
    fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
    fontSize: '12pt',
    lineHeight: 1.2,
    marginBottom: '1em',
    direction: 'ltr',
    // Removed unicodeBidi: 'plaintext',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  
  switch (type) {
    case 'scene-heading':
      return {
        ...baseStyles,
        width: 'calc(100% - 2.5in)',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: FINAL_DRAFT_MARGINS.sceneHeading.left,
        textAlign: 'left'
      };
    case 'action':
      return {
        ...baseStyles,
        width: 'calc(100% - 2.5in)',
        marginLeft: FINAL_DRAFT_MARGINS.action.left,
        textAlign: 'left'
      };
    case 'character':
      return {
        ...baseStyles,
        width: '38%',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: FINAL_DRAFT_MARGINS.character.left,
        textAlign: 'left'
      };
    case 'dialogue':
      return {
        ...baseStyles,
        width: '62%',
        marginLeft: FINAL_DRAFT_MARGINS.dialogue.left,
        textAlign: 'left'
      };
    case 'parenthetical':
      return {
        ...baseStyles,
        width: '50%',
        fontStyle: 'italic',
        marginLeft: FINAL_DRAFT_MARGINS.parenthetical.left,
        textAlign: 'left'
      };
    case 'transition':
      return {
        ...baseStyles,
        width: 'calc(100% - 2.5in)',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: FINAL_DRAFT_MARGINS.transition.left
      };
    case 'note':
      return {
        ...baseStyles,
        width: 'calc(100% - 2.5in)',
        fontStyle: 'italic',
        color: '#666',
        marginLeft: FINAL_DRAFT_MARGINS.action.left,
        textAlign: 'left'
      };
    default:
      return { 
        ...baseStyles, 
        width: 'calc(100% - 2.5in)',
        marginLeft: FINAL_DRAFT_MARGINS.action.left,
        textAlign: 'left'
      };
  }
};

// Final Draft pagination calculation (utility function)
export const calculatePages = (elements: any[]): number => {
  // Final Draft averages 54-55 lines per page
  const LINES_PER_PAGE = 54;
  
  let totalLines = 0;
  
  elements.forEach(element => {
    const text = element.text || '';
    const baseLines = Math.max(1, Math.ceil(text.length / 60)); // ~60 chars per line
    
    switch(element.type) {
      case 'scene-heading':
        totalLines += 1 + 1; // 1 for heading + 1 for spacing
        break;
      case 'action':
        totalLines += baseLines;
        break;
      case 'character':
        totalLines += 1;
        break;
      case 'dialogue':
        totalLines += baseLines;
        break;
      case 'parenthetical':
        totalLines += 1;
        break;
      case 'transition':
        totalLines += 2; // 1 for transition + 1 for spacing
        break;
      default:
        totalLines += baseLines;
    }
  });
  
  return Math.max(1, Math.ceil(totalLines / LINES_PER_PAGE));
};
