
import React from 'react';
import { ElementType } from '@/lib/types';
import { formatType } from '@/lib/formatScript';

interface ElementTypeMenuProps {
  currentType: ElementType;
  onElementTypeChange: (type: ElementType) => void;
}

const ElementTypeMenu: React.FC<ElementTypeMenuProps> = ({ currentType, onElementTypeChange }) => {
  const elementTypes: ElementType[] = [
    'scene-heading',
    'action',
    'character',
    'dialogue',
    'parenthetical',
    'transition',
    'note',
  ];

  return (
    <div className="absolute left-0 top-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 py-1">
      <div className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        Element Type
      </div>
      <ul>
        {elementTypes.map((type) => (
          <li key={type}>
            <button
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${
                currentType === type ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
              }`}
              onClick={() => onElementTypeChange(type)}
            >
              {formatType(type)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ElementTypeMenu;
