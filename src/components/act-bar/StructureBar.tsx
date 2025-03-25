
import React from 'react';
import { ActType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface StructureBarButtonProps {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  onClick: () => void;
  beats?: Array<{id: string; title: string; description?: string; complete?: boolean; sceneCount?: number; pageRange?: string;}>;
}

interface StructureBarProps {
  visibleActs: Array<StructureBarButtonProps>;
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  className?: string;
  activeBeatId?: string | null;
  onBeatClick?: (beatId: string) => void;
  showBeats?: boolean;
}

const StructureBar: React.FC<StructureBarProps> = ({ 
  visibleActs,
  activeAct,
  onSelectAct,
  className,
  activeBeatId,
  onBeatClick,
  showBeats = true
}) => {
  return (
    <div className="w-full space-y-1">
      <TooltipProvider>
        <div className={cn("rounded-md overflow-hidden w-full border border-gray-200 dark:border-gray-700 flex shadow-sm", className)}>
          {visibleActs.map((actBtn) => (
            <Tooltip key={actBtn.id}>
              <TooltipTrigger asChild>
                <div 
                  onClick={actBtn.onClick}
                  className={cn(
                    actBtn.bgColor, 
                    actBtn.isActive ? 'ring-2 ring-inset ring-blue-500' : '',
                    "flex-grow text-center py-1.5 cursor-pointer transition-all hover:brightness-95 active:brightness-90"
                  )}
                  style={{ flex: 1 }}
                >
                  <span className={cn("text-xs font-medium", actBtn.color)}>
                    {actBtn.label}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show scenes in {actBtn.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default StructureBar;
