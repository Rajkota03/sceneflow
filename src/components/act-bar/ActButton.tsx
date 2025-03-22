
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ActButtonProps {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  count?: number;
  beatCount?: number;
  onClick: () => void;
}

const ActButton: React.FC<ActButtonProps> = ({
  id,
  label,
  color,
  bgColor,
  isActive,
  count = 0,
  beatCount = 0,
  onClick
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className={cn(
              "h-7 px-3 text-xs",
              isActive 
                ? `${bgColor} ${color}`
                : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
            )}
          >
            {label}
            {count > 0 && (
              <span className="ml-1 opacity-80">({count})</span>
            )}
            {beatCount > 0 && beatCount !== count && (
              <span className="ml-1 opacity-80 text-amber-600">[{beatCount}]</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Show only scenes in {label}</p>
          {beatCount > 0 && (
            <p className="text-xs text-amber-600 mt-1">{beatCount} scenes tagged in this act</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ActButton;
