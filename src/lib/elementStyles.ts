
import { ElementType } from '@/lib/types';

// Maps element types to Tailwind classes for rendering
export const renderStyle = (type: ElementType) => {
  switch (type) {
    case 'scene-heading':
      return 'font-bold mb-4';
    case 'action':
      return 'mb-4';
    case 'character':
      return 'font-bold mb-1';
    case 'dialogue':
      return 'mb-4';
    case 'parenthetical':
      return 'italic mb-1';
    case 'transition':
      return 'text-right font-bold mb-4';
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
  
  return baseStyles;
};

// Simple page count estimation
export const calculatePages = (elements: any[]): number => {
  // Basic estimation
  return Math.max(1, Math.ceil(elements.length / 20));
};
