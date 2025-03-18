import React from 'react';
import { Act, Beat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ActSortableBeats from './ActSortableBeats';

interface ActSectionProps {
  act: Act;
  isExpanded: boolean;
  toggleAct: (actId: string) => void;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatsReorder: (actId: string, reorderedBeats: Beat[]) => void;
  onBeatUpdate: (actId: string, beatId: string, updatedBeat: Partial<Beat>) => void;
  isEditing: boolean;
}

const ActSection: React.FC<ActSectionProps> = ({
  act,
  isExpanded,
  toggleAct,
  onBeatToggleComplete,
  onBeatsReorder,
  onBeatUpdate,
  isEditing
}) => {
  // Calculate act progress
  const getActProgressPercentage = () => {
    const totalActBeats = act.beats.length;
    const completeActBeats = act.beats.filter(beat => beat.completed).length;
    return totalActBeats > 0 ? (completeActBeats / totalActBeats) * 100 : 0;
  };

  // Calculate approximate page range for act
  const getActPageRange = () => {
    // Assuming 120 pages screenplay (standard feature length)
    const startPage = Math.round((act.startPosition / 100) * 120);
    const endPage = Math.round((act.endPosition / 100) * 120);
    return `${startPage}-${endPage}`;
  };

  const actProgress = getActProgressPercentage();
  const isMidpoint = act.title.toLowerCase().includes('midpoint');

  // Color scheme consistent with the specified design
  const getActColors = () => {
    if (act.title.includes("Act 1")) {
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        dot: "bg-blue-500",
        hover: "hover:bg-blue-100"
      };
    } else if (act.title.includes("Act 2A")) {
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        dot: "bg-yellow-500",
        hover: "hover:bg-yellow-100"
      };
    } else if (act.title.includes("Act 2B")) {
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        dot: "bg-amber-500",
        hover: "hover:bg-amber-100"
      };
    } else if (act.title.includes("Act 3")) {
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        dot: "bg-red-500",
        hover: "hover:bg-red-100"
      };
    } else if (isMidpoint) {
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        dot: "bg-orange-500",
        hover: "hover:bg-orange-100"
      };
    }
    return {
      bg: "bg-gray-50",
      border: "border-gray-200",
      dot: "bg-gray-500",
      hover: "hover:bg-gray-100"
    };
  };

  const colors = getActColors();

  return (
    <Collapsible 
      open={isExpanded} 
      onOpenChange={() => toggleAct(act.id)}
      className={cn(
        "border rounded-md overflow-hidden transition-all duration-200 hover:shadow-sm",
        isMidpoint && "border-orange-300"
      )}
    >
      <div className={cn(
        "flex items-center justify-between p-4 transition-colors",
        colors.bg,
        colors.border
      )}>
        <div className="flex items-center gap-3 flex-grow">
          <div className={cn(
            "w-3 h-3 rounded-full flex-shrink-0",
            colors.dot
          )} />
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800">{act.title}</h3>
            
            <div className="flex items-center gap-3 mt-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs bg-white">
                      <FileText className="h-3 w-3 mr-1" />
                      Pages {getActPageRange()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Screenplay page range</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex items-center gap-2">
                <Progress 
                  value={actProgress} 
                  className={cn(
                    "h-1.5 w-24",
                    actProgress === 0 ? "bg-gray-200" :
                    actProgress < 30 ? "bg-red-100" :
                    actProgress < 70 ? "bg-yellow-100" : "bg-green-100"
                  )}
                />
                <span className="text-xs text-gray-600 font-medium">{Math.round(actProgress)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? 
              <ChevronDown className="h-4 w-4 text-gray-600" /> : 
              <ChevronRight className="h-4 w-4 text-gray-600" />
            }
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className={cn(
        "px-4 py-3 transition-all",
        colors.bg + "/30"
      )}>
        <ActSortableBeats
          act={act}
          isExpanded={true}
          onBeatToggleComplete={onBeatToggleComplete}
          onBeatsReorder={onBeatsReorder}
          onBeatUpdate={onBeatUpdate}
          isEditing={isEditing}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ActSection;
