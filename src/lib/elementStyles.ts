
import { ElementType } from '@/lib/types';

export const renderStyle = (type: ElementType, previousElementType?: ElementType) => {
  switch (type) {
    case 'scene-heading':
      return 'font-bold uppercase tracking-wider mb-4';
    case 'action':
      return 'mb-4';
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

export const getElementStyles = (type: ElementType): React.CSSProperties => {
  switch (type) {
    case 'scene-heading':
      return {
        width: '100%',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      };
    case 'action':
      return {
        width: '100%'
      };
    case 'character':
      return {
        width: '30%',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: 'auto',
        marginRight: 'auto'
      };
    case 'dialogue':
      return {
        width: '65%',
        marginLeft: 'auto',
        marginRight: 'auto'
      };
    case 'parenthetical':
      return {
        width: '40%',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontStyle: 'italic'
      };
    case 'transition':
      return {
        width: '100%',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontWeight: 'bold'
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
