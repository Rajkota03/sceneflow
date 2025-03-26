
import { ElementType } from '@/lib/types';

export const renderStyle = (type: ElementType, previousElementType?: ElementType) => {
  switch (type) {
    case 'scene-heading':
      return 'font-bold uppercase tracking-wider mb-4 text-left';
    case 'action':
      return 'mb-4 text-left';
    case 'character':
      return 'text-center font-bold mb-0 mx-auto';
    case 'dialogue':
      return 'mb-4 mx-auto';
    case 'parenthetical':
      return 'text-center italic mb-0 mx-auto';
    case 'transition':
      return 'text-right font-bold uppercase tracking-wider mb-4';
    case 'note':
      return 'text-sm italic text-gray-500 mb-2';
    default:
      return 'mb-4';
  }
};

// Updated measurements to match industry standards and Final Draft
export const getElementStyles = (type: ElementType): React.CSSProperties => {
  switch (type) {
    case 'scene-heading':
      return {
        width: '100%',
        textAlign: 'left',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: '1em', // Double space after scene headings
        marginLeft: '0',
        marginRight: '0',
        paddingTop: '0.5em',
        lineHeight: '1.2', // Reduced line height to match Final Draft
      };
    case 'action':
      return {
        width: '100%',
        textAlign: 'left',
        marginBottom: '0.5em', // Single space between action paragraphs
        marginLeft: '0',
        marginRight: '0',
        lineHeight: '1.2', // Reduced line height to match Final Draft
      };
    case 'character':
      return {
        width: '38%', // Centered in the usable area
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
        marginTop: '0.8em', // Reduced space before character names
        marginBottom: '0', // No space between character and dialogue/parenthetical
        lineHeight: '1.2', // Reduced line height to match Final Draft
      };
    case 'dialogue':
      return {
        width: '62%', // ~3" dialogue block (about half of the 6" usable width)
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'left',
        marginBottom: '0.8em', // More space after dialogue
        lineHeight: '1.2', // Reduced line height to match Final Draft
      };
    case 'parenthetical':
      return {
        width: '40%', // Slightly narrower than dialogue
        marginLeft: 'auto',
        marginRight: 'auto',
        fontStyle: 'italic',
        textAlign: 'left',
        marginBottom: '0', // No space after parenthetical
        lineHeight: '1.2', // Reduced line height to match Final Draft
      };
    case 'transition':
      return {
        width: '100%',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginTop: '0.8em', // Less space before transitions
        marginBottom: '0.8em', // Less space after transitions
        lineHeight: '1.2', // Reduced line height to match Final Draft
      };
    case 'note':
      return {
        width: '100%',
        fontStyle: 'italic',
        color: '#666',
        lineHeight: '1.2', // Reduced line height to match Final Draft
      };
    default:
      return { width: '100%', lineHeight: '1.2' };
  }
};

// Script page styles with proper margins
export const getScriptPageStyles = (): React.CSSProperties => {
  return {
    width: '8.5in',
    minHeight: '11in',
    padding: '1in 1in 1in 1.5in', // Top, Right, Bottom, Left - standard screenplay margins
    fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
    fontSize: '12pt',
    lineHeight: '1.2', // Reduced line height to match Final Draft
    boxSizing: 'border-box',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    margin: '2rem auto',
    position: 'relative',
    pageBreakAfter: 'always',
    pageBreakInside: 'avoid'
  };
};

// Calculate lines per page based on standard screenplay formatting
export const LINES_PER_PAGE = 55; // Standard screenplay page has ~55 lines
export const calculatePageNumber = (lineNumber: number): number => {
  return Math.floor(lineNumber / LINES_PER_PAGE) + 1;
};

// Page content styles
export const getPageContentStyles = (): React.CSSProperties => {
  return {
    fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
    fontSize: '12pt',
    lineHeight: '1.2', // Reduced line height to match Final Draft
    position: 'relative',
    direction: 'ltr',
    unicodeBidi: 'plaintext'
  };
};
