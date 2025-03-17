
import React, { useState, useEffect } from 'react';
import { Act, Beat, Structure } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronDown, ChevronRight, Edit, Milestone, GripVertical, Save, X, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/use-toast';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BeatItemProps {
  act: Act;
  beat: Beat;
  isMidpoint: boolean;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatUpdate: (actId: string, beatId: string, updatedBeat: Partial<Beat>) => void;
  isEditing: boolean;
}

const SortableBeat: React.FC<BeatItemProps> = ({ 
  act, 
  beat, 
  isMidpoint, 
  onBeatToggleComplete,
  onBeatUpdate,
  isEditing
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: beat.id });

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [localTitle, setLocalTitle] = useState(beat.title);
  const [localDescription, setLocalDescription] = useState(beat.description);
  const [localNotes, setLocalNotes] = useState(beat.notes || '');
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleSave = () => {
    onBeatUpdate(act.id, beat.id, { title: localTitle });
    setEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    onBeatUpdate(act.id, beat.id, { description: localDescription });
    setEditingDescription(false);
  };

  const handleNotesSave = () => {
    onBeatUpdate(act.id, beat.id, { notes: localNotes });
    setEditingNotes(false);
  };

  // Calculate approximate screenplay page based on timePosition
  const getApproximatePages = () => {
    if (beat.pageRange) return beat.pageRange;
    
    // Assuming 120 pages screenplay (standard feature length)
    const startPage = Math.round((beat.timePosition / 100) * 120);
    const endPage = startPage + 3; // Just an approximation
    return `${startPage}-${endPage}`;
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 border-l-4 rounded-md mb-3 bg-white shadow-sm transition-all hover:shadow-md",
        beat.complete ? "opacity-80 bg-gray-50" : "opacity-100",
        isMidpoint ? `border-l-[6px] font-medium` : "",
        { "border-blue-500": act.title.includes("Act 1") },
        { "border-yellow-500": act.title.includes("Act 2A") },
        { "border-orange-500": isMidpoint },
        { "border-amber-500": act.title.includes("Act 2B") },
        { "border-red-500": act.title.includes("Act 3") }
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          {isEditing && (
            <button 
              className="cursor-grab text-gray-400 hover:text-gray-600" 
              {...attributes} 
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <Milestone className={cn(
            "h-4 w-4 flex-shrink-0",
            beat.complete ? "text-green-500" : "text-gray-400"
          )} />
          
          {isEditing && editingTitle ? (
            <div className="flex items-center gap-1 flex-grow">
              <Input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="text-sm font-medium h-8 py-1"
                autoFocus
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                }}
              />
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleTitleSave}
                >
                  <Save className="h-3 w-3 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setLocalTitle(beat.title);
                    setEditingTitle(false);
                  }}
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>
          ) : (
            <h4 
              className={cn(
                "font-medium text-sm transition-colors",
                isEditing && "hover:text-blue-600 cursor-pointer"
              )}
              onClick={() => isEditing && setEditingTitle(true)}
            >
              {beat.title}
            </h4>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 font-normal">
            <FileText className="h-3 w-3 mr-1" />
            Pages {beat.pageRange || getApproximatePages()}
          </Badge>
          {isEditing && onBeatToggleComplete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Mark as {beat.complete ? "incomplete" : "complete"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {isEditing && editingDescription ? (
        <div className="mt-2">
          <Textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            className="text-xs resize-none"
            rows={2}
            autoFocus
            onBlur={handleDescriptionSave}
          />
          <div className="flex space-x-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleDescriptionSave}
            >
              <Save className="h-3 w-3 mr-1 text-green-500" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => {
                setLocalDescription(beat.description);
                setEditingDescription(false);
              }}
            >
              <X className="h-3 w-3 mr-1 text-red-500" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        beat.description && (
          <p 
            className={cn(
              "text-xs text-gray-600 mt-1",
              isEditing && "hover:text-blue-600 cursor-pointer hover:bg-blue-50 p-1 rounded"
            )}
            onClick={() => isEditing && setEditingDescription(true)}
          >
            {beat.description}
          </p>
        )
      )}
      
      {isEditing && editingNotes ? (
        <div className="mt-2">
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            className="text-xs resize-none bg-yellow-50 border-yellow-100"
            rows={3}
            autoFocus
            onBlur={handleNotesSave}
            placeholder="Add notes for this beat..."
          />
          <div className="flex space-x-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleNotesSave}
            >
              <Save className="h-3 w-3 mr-1 text-green-500" />
              Save Notes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => {
                setLocalNotes(beat.notes || '');
                setEditingNotes(false);
              }}
            >
              <X className="h-3 w-3 mr-1 text-red-500" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        beat.notes ? (
          <div 
            className={cn(
              "mt-2 p-2 bg-yellow-50 rounded text-xs text-gray-700 border border-yellow-100",
              isEditing && "cursor-pointer hover:bg-yellow-100"
            )}
            onClick={() => isEditing && setEditingNotes(true)}
          >
            <p className="font-medium text-xs mb-1">Notes:</p>
            <p>{beat.notes}</p>
          </div>
        ) : isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 mt-2 text-xs text-gray-500"
            onClick={() => setEditingNotes(true)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Add Notes
          </Button>
        ) : null
      )}
    </div>
  );
};

interface ActSortableBeatsProps {
  act: Act;
  isExpanded: boolean;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatsReorder: (actId: string, reorderedBeats: Beat[]) => void;
  onBeatUpdate: (actId: string, beatId: string, updatedBeat: Partial<Beat>) => void;
  isEditing: boolean;
}

const ActSortableBeats: React.FC<ActSortableBeatsProps> = ({
  act,
  isExpanded,
  onBeatToggleComplete,
  onBeatsReorder,
  onBeatUpdate,
  isEditing
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = act.beats.findIndex(beat => beat.id === active.id);
      const newIndex = act.beats.findIndex(beat => beat.id === over.id);
      
      const reorderedBeats = arrayMove(act.beats, oldIndex, newIndex);
      onBeatsReorder(act.id, reorderedBeats);
    }
  };

  if (!isExpanded) return null;

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={act.beats.map(beat => beat.id)}
        strategy={verticalListSortingStrategy}
      >
        {act.beats.map(beat => {
          const isMidpoint = act.title.toLowerCase().includes('midpoint') && 
            beat.title.toLowerCase().includes('midpoint');
          
          return (
            <SortableBeat
              key={beat.id}
              act={act}
              beat={beat}
              isMidpoint={isMidpoint}
              onBeatToggleComplete={onBeatToggleComplete}
              onBeatUpdate={onBeatUpdate}
              isEditing={isEditing}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
};

interface ThreeActStructurePanelProps {
  structure: Structure;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatDragDrop?: (beatId: string, targetSceneId: string) => void;
  onStructureUpdate?: (updatedStructure: Structure) => Promise<void>;
  linkedToProject?: boolean;
}

const ThreeActStructurePanel: React.FC<ThreeActStructurePanelProps> = ({
  structure,
  onBeatToggleComplete,
  onBeatDragDrop,
  onStructureUpdate,
  linkedToProject = false
}) => {
  const [expandedActs, setExpandedActs] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [localStructure, setLocalStructure] = useState<Structure>(structure);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    // Initialize with all acts expanded
    const initialExpandedState: Record<string, boolean> = {};
    structure.acts.forEach(act => {
      initialExpandedState[act.id] = true;
    });
    setExpandedActs(initialExpandedState);
  }, [structure.acts]);

  useEffect(() => {
    // Reset local structure when the prop changes
    setLocalStructure(structure);
    setHasChanges(false);
  }, [structure]);
  
  const toggleAct = (actId: string) => {
    setExpandedActs(prev => ({
      ...prev,
      [actId]: !prev[actId]
    }));
  };
  
  // Calculate overall progress
  const totalBeats = localStructure.acts.reduce((sum, act) => sum + act.beats.length, 0);
  const completeBeats = localStructure.acts.reduce((sum, act) => 
    sum + act.beats.filter(beat => beat.complete).length, 0);
  const progressPercentage = totalBeats > 0 ? (completeBeats / totalBeats) * 100 : 0;
  
  const handleBeatsReorder = (actId: string, reorderedBeats: Beat[]) => {
    const updatedActs = localStructure.acts.map(act => 
      act.id === actId ? { ...act, beats: reorderedBeats } : act
    );
    
    setLocalStructure({
      ...localStructure,
      acts: updatedActs
    });
    setHasChanges(true);
  };
  
  const handleBeatUpdate = (actId: string, beatId: string, updatedBeatFields: Partial<Beat>) => {
    const updatedActs = localStructure.acts.map(act => {
      if (act.id === actId) {
        const updatedBeats = act.beats.map(beat => 
          beat.id === beatId ? { ...beat, ...updatedBeatFields } : beat
        );
        return { ...act, beats: updatedBeats };
      }
      return act;
    });
    
    setLocalStructure({
      ...localStructure,
      acts: updatedActs
    });
    setHasChanges(true);
  };
  
  const handleSaveStructure = async () => {
    if (!onStructureUpdate) {
      toast({
        title: "Cannot save structure",
        description: "Save function not provided. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await onStructureUpdate(localStructure);
      toast({
        title: "Success",
        description: "Structure saved successfully"
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving structure:", error);
      toast({
        title: "Error",
        description: "Failed to save structure",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getActProgressPercentage = (act: Act) => {
    const totalActBeats = act.beats.length;
    const completeActBeats = act.beats.filter(beat => beat.complete).length;
    return totalActBeats > 0 ? (completeActBeats / totalActBeats) * 100 : 0;
  };

  // Calculate approximate page range for act
  const getActPageRange = (act: Act) => {
    // Assuming 120 pages screenplay (standard feature length)
    const startPage = Math.round((act.startPosition / 100) * 120);
    const endPage = Math.round((act.endPosition / 100) * 120);
    return `${startPage}-${endPage}`;
  };
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{localStructure.name}</h2>
          {linkedToProject && localStructure.projectTitle && (
            <span className="text-sm text-gray-600">
              Linked to: {localStructure.projectTitle}
            </span>
          )}
        </div>
        
        {localStructure.description && (
          <p className="text-sm text-gray-600 mb-3">{localStructure.description}</p>
        )}
        
        <div className="flex items-center gap-3 mb-3">
          <Progress value={progressPercentage} className="h-2 flex-grow" />
          <span className="text-sm font-medium">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="flex items-center justify-end mb-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant={hasChanges ? "default" : "outline"} 
                onClick={handleSaveStructure} 
                disabled={isSaving || !hasChanges}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-3 w-3 mr-1" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setLocalStructure(structure); // Reset to original structure
                  setHasChanges(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant={onStructureUpdate ? "default" : "outline"} 
              onClick={() => setIsEditing(true)}
              disabled={!onStructureUpdate}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit Structure
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {localStructure.acts.map((act) => {
          const actProgress = getActProgressPercentage(act);
          const isMidpoint = act.title.toLowerCase().includes('midpoint');
          
          return (
            <Collapsible 
              key={act.id} 
              open={expandedActs[act.id]} 
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
                              Pages {getActPageRange(act)}
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
                    {expandedActs[act.id] ? 
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
                  onBeatsReorder={handleBeatsReorder}
                  onBeatUpdate={handleBeatUpdate}
                  isEditing={isEditing}
                />
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default ThreeActStructurePanel;
