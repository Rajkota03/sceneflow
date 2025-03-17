
import React from 'react';
import { Act } from '@/lib/types';
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
  onBeatsReorder: (actId: string, reorderedBeats: any[]) => void;
  onBeatUpdate: (actId: string, beatId: string, updatedBeat: any) => void;
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
    const completeActBeats = act.beats.filter(beat => beat.complete).length;
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
        "flex items-center justify-between p-3 transition-colors",
        { "bg-blue-50 border-blue-200": act.title.includes("Act 1") },
        { "bg-yellow-50 border-yellow-200": act.title.includes("Act 2A") },
        { "bg-amber-50 border-amber-200": act.title.includes("Act 2B") },
        { "bg-red-50 border-red-200": act.title.includes("Act 3") },
        { "bg-orange-50 border-orange-200": isMidpoint }
      )}>
        <div className="flex items-center gap-2 flex-grow">
          <div className={cn(
            "w-3 h-3 rounded-full flex-shrink-0",
            { "bg-blue-500": act.title.includes("Act 1") },
            { "bg-yellow-500": act.title.includes("Act 2A") },
            { "bg-amber-500": act.title.includes("Act 2B") },
            { "bg-red-500": act.title.includes("Act 3") },
            { "bg-orange-500": isMidpoint }
          )} />
          <div className="flex flex-col">
            <h3 className="font-medium">{act.title}</h3>
            
            <div className="flex items-center gap-2 mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs bg-white">
                      <FileText className="h-3 w-3 mr-1" />
                      Pages {getActPageRange()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Approximate page range in screenplay</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex items-center gap-1 ml-2">
                <Progress 
                  value={actProgress} 
                  className={cn(
                    "h-1.5 w-20",
                    actProgress === 0 ? "bg-gray-200" :
                    actProgress < 30 ? "bg-red-100" :
                    actProgress < 70 ? "bg-yellow-100" : "bg-green-100"
                  )}
                />
                <span className="text-xs text-gray-600">{Math.round(actProgress)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className={cn(
        "p-3 transition-all",
        { "bg-blue-50/30": act.title.includes("Act 1") },
        { "bg-yellow-50/30": act.title.includes("Act 2A") },
        { "bg-amber-50/30": act.title.includes("Act 2B") },
        { "bg-red-50/30": act.title.includes("Act 3") },
        { "bg-orange-50/30": isMidpoint }
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
