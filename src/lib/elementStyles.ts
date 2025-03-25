
import { ElementType } from '@/lib/types';

export const renderStyle = (type: ElementType, previousElementType?: ElementType) => {
  switch (type) {
    case 'scene-heading':
      return 'font-bold uppercase tracking-wider mb-4 text-left';
    case 'action':
      return 'mb-4 text-left';
    case 'character':
      return 'text-center font-bold mb-1 mx-auto';
    case 'dialogue':
      return 'mb-4 mx-auto';
    case 'parenthetical':
      return 'text-center italic mb-1 mx-auto';
    case 'transition':
      return 'text-right font-bold uppercase tracking-wider mb-4';
    case 'note':
      return 'text-sm italic text-gray-500 mb-2';
    default:
      return 'mb-4';
  }
};

// Updated measurements to match industry standards
export const getElementStyles = (type: ElementType): React.CSSProperties => {
  switch (type) {
    case 'scene-heading':
      return {
        width: '100%',
        textAlign: 'left',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: '1em',
        marginLeft: '0',
        marginRight: '0',
        paddingTop: '0.5em',
      };
    case 'action':
      return {
        width: '100%',
        textAlign: 'left',
        marginBottom: '1em',
        marginLeft: '0',
        marginRight: '0'
      };
    case 'character':
      return {
        width: '38%', // Centered in the usable area
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
        marginTop: '1em',
        marginBottom: '0.1em'
      };
    case 'dialogue':
      return {
        width: '62%', // ~3" dialogue block (about half of the 6" usable width)
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'left',
        marginBottom: '1em'
      };
    case 'parenthetical':
      return {
        width: '40%', // Slightly narrower than dialogue
        marginLeft: 'auto',
        marginRight: 'auto',
        fontStyle: 'italic',
        textAlign: 'left',
        marginBottom: '0.1em'
      };
    case 'transition':
      return {
        width: '100%',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginTop: '1em',
        marginBottom: '1em'
      };
    case 'note':
      return {
        width: '100%',
        fontStyle: 'italic',
        color: '#666'
      };
    default:
      return { width: '100%' };
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
    lineHeight: '1.2',
    boxSizing: 'border-box'
  };
};

// Page content styles
export const getPageContentStyles = (): React.CSSProperties => {
  return {
    fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
    fontSize: '12pt',
    lineHeight: '1.2',
    position: 'relative',
    direction: 'ltr',
    unicodeBidi: 'plaintext'
  };
};
