
import React from 'react';
import { Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const StructureUnavailableMessage: React.FC = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full text-gray-500"
          >
            <Map size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>No story structure selected. Select a structure to tag beats.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StructureUnavailableMessage;
