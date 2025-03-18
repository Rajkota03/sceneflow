
import React from 'react';
import { Button } from '../ui/button';
import { BeatMode } from '@/types/scriptTypes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { BookText, FileText, Zap } from 'lucide-react';

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
            className={`h-8 px-3 ${beatMode === 'on' ? 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600' : 'text-gray-600 dark:text-gray-400'}`}
          >
            {beatMode === 'on' ? (
              <Zap size={16} className="mr-1" />
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
