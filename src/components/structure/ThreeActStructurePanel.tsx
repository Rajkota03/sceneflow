
import React, { useState, useRef } from 'react';
import { Act, Beat, Structure } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronDown, ChevronRight, Edit, Milestone, GripVertical, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  onBeatEdit?: (actId: string, beatId: string) => void;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatUpdate: (actId: string, beatId: string, updatedBeat: Partial<Beat>) => void;
  isEditing: boolean;
}

const SortableBeat: React.FC<BeatItemProps> = ({ 
  act, 
  beat, 
  isMidpoint, 
  onBeatEdit, 
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

  return (
    <div 
      ref={setNodeRef}
      style={style}
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
            "h-4 w-4",
            beat.complete ? "text-green-500" : "text-gray-400"
          )} />
          
          {isEditing && editingTitle ? (
            <div className="flex items-center gap-1">
              <Input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="text-sm font-medium h-7 py-1"
                autoFocus
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleTitleSave}
              >
                <Save className="h-3 w-3 text-green-500" />
              </Button>
            </div>
          ) : (
            <h4 
              className="font-medium text-sm"
              onClick={() => isEditing && setEditingTitle(true)}
            >
              {beat.title}
            </h4>
          )}
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
          <Button
            variant="ghost"
            size="sm"
            className="h-6 mt-1"
            onClick={handleDescriptionSave}
          >
            <Save className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-xs">Save Description</span>
          </Button>
        </div>
      ) : (
        beat.description && (
          <p 
            className="text-xs text-gray-600 mt-1 cursor-pointer"
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
          <Button
            variant="ghost"
            size="sm"
            className="h-6 mt-1"
            onClick={handleNotesSave}
          >
            <Save className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-xs">Save Notes</span>
          </Button>
        </div>
      ) : (
        beat.notes && (
          <div 
            className="mt-2 p-2 bg-yellow-50 rounded text-xs text-gray-700 border border-yellow-100 cursor-pointer"
            onClick={() => isEditing && setEditingNotes(true)}
          >
            <p className="font-medium text-xs mb-1">Notes:</p>
            <p>{beat.notes}</p>
          </div>
        )
      )}
    </div>
  );
};

interface ActSortableBeatsProps {
  act: Act;
  isExpanded: boolean;
  onBeatEdit?: (actId: string, beatId: string) => void;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatsReorder: (actId: string, reorderedBeats: Beat[]) => void;
  onBeatUpdate: (actId: string, beatId: string, updatedBeat: Partial<Beat>) => void;
  isEditing: boolean;
}

const ActSortableBeats: React.FC<ActSortableBeatsProps> = ({
  act,
  isExpanded,
  onBeatEdit,
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
              onBeatEdit={onBeatEdit}
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
  onBeatEdit?: (actId: string, beatId: string) => void;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatDragDrop?: (beatId: string, targetSceneId: string) => void;
  onStructureUpdate?: (updatedStructure: Structure) => Promise<void>;
  linkedToProject?: boolean;
}

const ThreeActStructurePanel: React.FC<ThreeActStructurePanelProps> = ({
  structure,
  onBeatEdit,
  onBeatToggleComplete,
  onBeatDragDrop,
  onStructureUpdate,
  linkedToProject = false
}) => {
  const [expandedActs, setExpandedActs] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [localStructure, setLocalStructure] = useState<Structure>(structure);
  const [isSaving, setIsSaving] = useState(false);
  
  const toggleAct = (actId: string) => {
    setExpandedActs(prev => ({
      ...prev,
      [actId]: !prev[actId]
    }));
  };
  
  const expandAllActs = () => {
    const allExpanded: Record<string, boolean> = {};
    structure.acts.forEach(act => {
      allExpanded[act.id] = true;
    });
    setExpandedActs(allExpanded);
  };
  
  const collapseAllActs = () => {
    setExpandedActs({});
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
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={expandAllActs}>
              <ChevronDown className="h-3 w-3 mr-1" />
              Expand All
            </Button>
            <Button size="sm" variant="outline" onClick={collapseAllActs}>
              <ChevronRight className="h-3 w-3 mr-1" />
              Collapse All
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={handleSaveStructure} 
                  disabled={isSaving}
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
                  }}
                >
                  Cancel
                </Button>
              </>
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
      </div>
      
      <div className="space-y-3">
        {localStructure.acts.map((act) => (
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
              { "bg-red-50 border-red-200": act.title.includes("Act 3") },
              { "bg-orange-50 border-orange-200": act.title.includes("Midpoint") }
            )}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  { "bg-blue-500": act.title.includes("Act 1") },
                  { "bg-yellow-500": act.title.includes("Act 2A") },
                  { "bg-amber-500": act.title.includes("Act 2B") },
                  { "bg-red-500": act.title.includes("Act 3") },
                  { "bg-orange-500": act.title.includes("Midpoint") }
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
              <ActSortableBeats
                act={act}
                isExpanded={true}
                onBeatEdit={onBeatEdit}
                onBeatToggleComplete={onBeatToggleComplete}
                onBeatsReorder={handleBeatsReorder}
                onBeatUpdate={handleBeatUpdate}
                isEditing={isEditing}
              />
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default ThreeActStructurePanel;
