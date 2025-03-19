
import React from 'react';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeatTagButtonProps {
  hasBeatTag: boolean;
  beatTitle?: string;
  onClick: () => void;
}

const BeatTagButton: React.FC<BeatTagButtonProps> = ({
  hasBeatTag,
  beatTitle,
  onClick
}) => {
  return (
    <Button 
      variant={hasBeatTag ? "default" : "outline"} 
      size="sm" 
      onClick={onClick}
      className={cn(
        "h-6 px-2",
        hasBeatTag 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'border-dashed border-gray-300 text-gray-500'
      )}
    >
      <Flame size={14} className={hasBeatTag ? 'mr-1' : ''} />
      {beatTitle}
    </Button>
  );
};

export default BeatTagButton;
