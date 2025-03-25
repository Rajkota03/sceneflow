
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookText, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BeatMode } from '@/types/scriptTypes';

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
            className={cn(
              "h-8 px-3 transition-colors duration-200",
              beatMode === 'on' 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" 
                : "bg-transparent text-gray-600 dark:text-gray-400"
            )}
          >
            {beatMode === 'on' ? (
              <BookText size={15} className="mr-1.5" />
            ) : (
              <FileText size={15} className="mr-1.5" />
            )}
            <span className="text-xs font-medium">
              {beatMode === 'on' ? 'Beat Mode' : 'Script Mode'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Toggle beat tracking mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BeatModeToggle;
