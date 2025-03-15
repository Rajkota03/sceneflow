
import React from 'react';
import { Tag, X } from 'lucide-react';

interface SceneTagProps {
  tag: string;
  onRemove?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const SceneTag: React.FC<SceneTagProps> = ({ 
  tag, 
  onRemove, 
  selectable = false,
  selected = false,
  onClick 
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs mr-1 mb-1 ${
        selected 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
      } ${selectable ? 'cursor-pointer' : ''}`}
      onClick={selectable ? handleClick : undefined}
    >
      <Tag size={12} className="mr-1" />
      <span>{tag}</span>
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-red-500"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default SceneTag;
