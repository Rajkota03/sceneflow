
import React from 'react';
import { ActType } from '@/lib/types';
import { Button } from '../ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface ActButtonProps {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  count?: number;
  onClick: () => void;
}

const ActButton: React.FC<ActButtonProps> = ({
  id,
  label,
  color,
  bgColor,
  isActive,
  count = 0,
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
            className={`h-7 px-3 text-xs ${
              isActive 
                ? `${bgColor} ${color}`
                : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
            }`}
          >
            {label}
            {count > 0 && (
              <span className="ml-1 opacity-80">({count})</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Show only scenes in {label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ActButton;
