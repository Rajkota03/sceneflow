
import React from 'react';
import { cn } from '@/lib/utils';

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
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {beatTitle}
        </>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l6 6 6-6"></path>
          <path d="M3 17l6 6 6-6"></path>
        </svg>
      )}
    </button>
  );
};

export default BeatTagButton;
