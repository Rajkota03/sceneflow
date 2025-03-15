
import React from 'react';
import { Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SceneTagProps {
  tag: string;
  onRemove?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const SceneTag: React.FC<SceneTagProps> = ({ 
  tag, 
  onRemove, 
  selectable = false,
  selected = false,
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  // Determine if this is an act tag and get appropriate color
  const isActTag = tag.startsWith('Act 1:') || 
                   tag.startsWith('Act 2A:') || 
                   tag.startsWith('Midpoint:') || 
                   tag.startsWith('Act 2B:') || 
                   tag.startsWith('Act 3:');

  const getActTagColor = () => {
    if (tag.startsWith('Act 1:')) return 'bg-[#D3E4FD] text-[#2171D2]';
    if (tag.startsWith('Act 2A:')) return 'bg-[#FEF7CD] text-[#D28A21]';
    if (tag.startsWith('Midpoint:')) return 'bg-[#FFCCCB] text-[#D24E4D]';
    if (tag.startsWith('Act 2B:')) return 'bg-[#FDE1D3] text-[#D26600]';
    if (tag.startsWith('Act 3:')) return 'bg-[#F2FCE2] text-[#007F73]';
    return '';
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs mr-1 mb-1',
        isActTag ? getActTagColor() : (
          selected 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
        ),
        selectable ? 'cursor-pointer' : '',
        className
      )}
      onClick={selectable ? handleClick : undefined}
    >
      <Tag size={12} className="mr-1" />
      <span>{isActTag ? tag.split(': ')[1] : tag}</span>
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
