
import React from 'react';
import { ElementType } from '@/lib/types';
import { formatType } from '@/lib/formatScript';

interface ElementTypeMenuProps {
  currentType: ElementType;
  onElementTypeChange: (newType: ElementType) => void;
}

const ElementTypeMenu: React.FC<ElementTypeMenuProps> = ({ 
  currentType, 
  onElementTypeChange 
}) => {
  return (
    <div className="absolute top-full left-0 w-48 bg-white border border-gray-300 shadow-md rounded-md z-50">
      {['scene-heading', 'action', 'character', 'dialogue', 'parenthetical', 'transition'].map((type) => (
        <div 
          key={type}
          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${currentType === type ? 'bg-gray-100' : ''}`}
          onClick={() => onElementTypeChange(type as ElementType)}
        >
          {formatType(type as ElementType)}
          <span className="text-xs text-gray-500 ml-2">
            {type === 'scene-heading' && '⌘1'}
            {type === 'action' && '⌘2'}
            {type === 'character' && '⌘3'}
            {type === 'dialogue' && '⌘4'}
            {type === 'parenthetical' && '⌘5'}
            {type === 'transition' && '⌘6'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ElementTypeMenu;
