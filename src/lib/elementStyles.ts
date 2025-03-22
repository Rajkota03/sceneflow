
import { ElementType } from '@/lib/types';

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

// Get standard CSS styles for each element type
export const getElementStyles = (type: ElementType): React.CSSProperties => {
  // Base styles
  const baseStyles: React.CSSProperties = {
    fontFamily: '"Courier Prime", monospace',
    fontSize: '12pt',
    lineHeight: 1.2,
    marginBottom: '1em',
    direction: 'ltr',
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
        width: '100%',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textAlign: 'left'
      };
    case 'action':
      return {
        ...baseStyles,
        width: '100%',
        textAlign: 'left'
      };
    case 'character':
      return {
        ...baseStyles,
        width: '100%',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textAlign: 'left'
      };
    case 'dialogue':
      return {
        ...baseStyles,
        width: '100%',
        textAlign: 'left'
      };
    case 'parenthetical':
      return {
        ...baseStyles,
        width: '100%',
        fontStyle: 'italic',
        textAlign: 'left'
      };
    case 'transition':
      return {
        ...baseStyles,
        width: '100%',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      };
    case 'note':
      return {
        ...baseStyles,
        width: '100%',
        fontStyle: 'italic',
        color: '#666',
        textAlign: 'left'
      };
    default:
      return { 
        ...baseStyles, 
        width: '100%',
        textAlign: 'left'
      };
  }
};

// Simple page count estimation
export const calculatePages = (elements: any[]): number => {
  // Basic estimation
  return Math.max(1, Math.ceil(elements.length / 20));
};
