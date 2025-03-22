
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, MapPin } from 'lucide-react';

interface BeatTagButtonProps {
  hasBeatTag: boolean;
  beatTitle?: string;
  onClick: () => void;
}

const BeatTagButton: React.FC<BeatTagButtonProps> = ({ 
  hasBeatTag, 
  beatTitle = 'Beat',
  onClick 
}) => {
  return (
    <button 
      className={cn(
        "h-6 px-2 text-xs rounded flex items-center",
        hasBeatTag 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'border border-dashed border-gray-300 text-gray-500 hover:bg-gray-100'
      )}
      onClick={onClick}
    >
      {hasBeatTag ? (
        <>
          <Check size={14} className="mr-1" />
          {beatTitle}
        </>
      ) : (
        <MapPin size={14} />
      )}
    </button>
  );
};

export default BeatTagButton;
