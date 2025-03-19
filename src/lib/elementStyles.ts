
import { ElementType } from '@/lib/types';

// Final Draft standard margins and positioning
const FINAL_DRAFT_MARGINS = {
  sceneHeading: { left: '1.5in', right: '1in' },
  action: { left: '1.5in', right: '1in' },
  character: { left: '3.5in', right: '1in' },
  dialogue: { left: '2.5in', right: '2.5in' },
  parenthetical: { left: '3in', right: '2.9in' },
  transition: { left: '5.5in', right: '1in' }
};

export const renderStyle = (type: ElementType, previousElementType?: ElementType) => {
  switch (type) {
    case 'scene-heading':
      return 'font-bold uppercase tracking-wide mb-4';
    case 'action':
      return 'mb-4';
    case 'character':
      return 'text-center font-bold uppercase mb-1 mx-auto';
    case 'dialogue':
      return 'mb-4 mx-auto';
    case 'parenthetical':
      return 'text-center italic mb-1 mx-auto';
    case 'transition':
      return 'text-right font-bold uppercase tracking-wide mb-4';
    case 'note':
      return 'text-sm italic text-gray-500 mb-2';
    default:
      return 'mb-4';
  }
};

export const getElementStyles = (type: ElementType): React.CSSProperties => {
  // Base styles following Final Draft standards
  const baseStyles: React.CSSProperties = {
    fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
    fontSize: '12pt',
    lineHeight: 1.2,
    marginBottom: '1em'
  };
  
  switch (type) {
    case 'scene-heading':
      return {
        ...baseStyles,
        width: '100%',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: FINAL_DRAFT_MARGINS.sceneHeading.left,
        paddingRight: FINAL_DRAFT_MARGINS.sceneHeading.right
      };
    case 'action':
      return {
        ...baseStyles,
        width: '100%',
        marginLeft: FINAL_DRAFT_MARGINS.action.left,
        paddingRight: FINAL_DRAFT_MARGINS.action.right
      };
    case 'character':
      return {
        ...baseStyles,
        width: '33%',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: FINAL_DRAFT_MARGINS.character.left,
        paddingRight: FINAL_DRAFT_MARGINS.character.right
      };
    case 'dialogue':
      return {
        ...baseStyles,
        width: '62%',
        marginLeft: FINAL_DRAFT_MARGINS.dialogue.left,
        paddingRight: FINAL_DRAFT_MARGINS.dialogue.right
      };
    case 'parenthetical':
      return {
        ...baseStyles,
        width: '40%',
        fontStyle: 'italic',
        marginLeft: FINAL_DRAFT_MARGINS.parenthetical.left,
        paddingRight: FINAL_DRAFT_MARGINS.parenthetical.right
      };
    case 'transition':
      return {
        ...baseStyles,
        width: '100%',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: FINAL_DRAFT_MARGINS.transition.left,
        paddingRight: FINAL_DRAFT_MARGINS.transition.right
      };
    case 'note':
      return {
        ...baseStyles,
        width: '100%',
        fontStyle: 'italic',
        color: '#666',
        marginLeft: FINAL_DRAFT_MARGINS.action.left,
        paddingRight: FINAL_DRAFT_MARGINS.action.right
      };
    default:
      return { 
        ...baseStyles, 
        width: '100%',
        marginLeft: FINAL_DRAFT_MARGINS.action.left,
        paddingRight: FINAL_DRAFT_MARGINS.action.right
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
