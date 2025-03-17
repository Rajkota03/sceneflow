
import React, { useState } from 'react';
import { Act, Beat, Structure } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronDown, ChevronRight, Edit, Milestone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThreeActStructurePanelProps {
  structure: Structure;
  onBeatEdit?: (actId: string, beatId: string) => void;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatDragDrop?: (beatId: string, targetSceneId: string) => void;
  linkedToProject?: boolean;
}

const ThreeActStructurePanel: React.FC<ThreeActStructurePanelProps> = ({
  structure,
  onBeatEdit,
  onBeatToggleComplete,
  onBeatDragDrop,
  linkedToProject = false
}) => {
  const [expandedActs, setExpandedActs] = useState<Record<string, boolean>>({});
  
  const toggleAct = (actId: string) => {
    setExpandedActs(prev => ({
      ...prev,
      [actId]: !prev[actId]
    }));
  };
  
  // Calculate overall progress
  const totalBeats = structure.acts.reduce((sum, act) => sum + act.beats.length, 0);
  const completeBeats = structure.acts.reduce((sum, act) => 
    sum + act.beats.filter(beat => beat.complete).length, 0);
  const progressPercentage = totalBeats > 0 ? (completeBeats / totalBeats) * 100 : 0;
  
  const renderBeat = (act: Act, beat: Beat) => {
    const isMidpoint = act.title.toLowerCase().includes('act 2') && 
      beat.title.toLowerCase().includes('midpoint');
    
    return (
      <div 
        key={beat.id}
        className={cn(
          "p-3 border-l-4 rounded-r mb-2 bg-white shadow-sm transition-all",
          beat.complete ? "opacity-70" : "opacity-100",
          isMidpoint ? `border-l-[6px] font-medium` : "",
          { "border-blue-500": act.title.includes("Act 1") },
          { "border-yellow-500": act.title.includes("Act 2A") },
          { "border-orange-500": isMidpoint },
          { "border-amber-500": act.title.includes("Act 2B") },
          { "border-red-500": act.title.includes("Act 3") }
        )}
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('beatId', beat.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            <Milestone className={cn(
              "h-4 w-4",
              beat.complete ? "text-green-500" : "text-gray-400"
            )} />
            <h4 className="font-medium text-sm">{beat.title}</h4>
          </div>
          <div className="flex items-center gap-1">
            {beat.pageRange && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                Pages {beat.pageRange}
              </span>
            )}
            {onBeatToggleComplete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onBeatToggleComplete(act.id, beat.id, !beat.complete)}
              >
                <Check className={cn(
                  "h-4 w-4",
                  beat.complete ? "text-green-500" : "text-gray-300"
                )} />
              </Button>
            )}
            {onBeatEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onBeatEdit(act.id, beat.id)}
              >
                <Edit className="h-3 w-3 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
        
        {beat.description && (
          <p className="text-xs text-gray-600 mt-1">{beat.description}</p>
        )}
        
        {beat.notes && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-gray-700 border border-yellow-100">
            <p className="font-medium text-xs mb-1">Notes:</p>
            <p>{beat.notes}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{structure.name}</h2>
          {linkedToProject && structure.projectTitle && (
            <span className="text-sm text-gray-600">
              Linked to: {structure.projectTitle}
            </span>
          )}
        </div>
        
        {structure.description && (
          <p className="text-sm text-gray-600 mb-3">{structure.description}</p>
        )}
        
        <div className="flex items-center gap-3">
          <Progress value={progressPercentage} className="h-2 flex-grow" />
          <span className="text-sm font-medium">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {structure.acts.map((act) => (
          <Collapsible 
            key={act.id} 
            open={expandedActs[act.id]} 
            onOpenChange={() => toggleAct(act.id)}
            className="border rounded-md overflow-hidden"
          >
            <div className={cn(
              "flex items-center justify-between p-3",
              { "bg-blue-50 border-blue-200": act.title.includes("Act 1") },
              { "bg-yellow-50 border-yellow-200": act.title.includes("Act 2A") },
              { "bg-amber-50 border-amber-200": act.title.includes("Act 2B") },
              { "bg-red-50 border-red-200": act.title.includes("Act 3") }
            )}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  { "bg-blue-500": act.title.includes("Act 1") },
                  { "bg-yellow-500": act.title.includes("Act 2A") },
                  { "bg-amber-500": act.title.includes("Act 2B") },
                  { "bg-red-500": act.title.includes("Act 3") }
                )} />
                <h3 className="font-medium">{act.title}</h3>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                        {Math.round(act.startPosition)}% - {Math.round(act.endPosition)}%
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Approximate page range</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {expandedActs[act.id] ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="p-3 bg-gray-50">
              {act.beats.map(beat => renderBeat(act, beat))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default ThreeActStructurePanel;
