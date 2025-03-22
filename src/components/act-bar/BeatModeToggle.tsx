
import React from 'react';
import { Button } from '../ui/button';
import { BeatMode } from '@/types/scriptTypes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { BookText, FileText } from 'lucide-react';

interface BeatModeToggleProps {
  beatMode: BeatMode;
  onToggleBeatMode: (mode: BeatMode) => void;
}

const BeatModeToggle: React.FC<BeatModeToggleProps> = ({
  beatMode,
  onToggleBeatMode
}) => {
  const handleToggle = () => {
    onToggleBeatMode(beatMode === 'on' ? 'off' : 'on');
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className={`h-8 px-2 ${beatMode === 'on' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'text-gray-600 dark:text-gray-400'}`}
          >
            {beatMode === 'on' ? (
              <BookText size={16} className="mr-1" />
            ) : (
              <FileText size={16} className="mr-1" />
            )}
            {beatMode === 'on' ? 'Beat Mode' : 'Script Mode'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle beat tracking mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BeatModeToggle;
