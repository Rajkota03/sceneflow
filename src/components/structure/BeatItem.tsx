import React, { useState } from 'react';
import { Act, Beat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Edit, GripVertical, Milestone, Save, X, FileText } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BeatItemProps {
  act: Act;
  beat: Beat;
  isMidpoint: boolean;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatUpdate: (actId: string, beatId: string, updatedBeat: Partial<Beat>) => void;
  isEditing: boolean;
}

const BeatItem: React.FC<BeatItemProps> = ({ 
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
        "p-3 border-l-4 rounded-md mb-3 bg-white shadow-sm transition-all hover:shadow-md group",
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
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
            </div>
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
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 mt-2 text-xs text-gray-500"
              onClick={() => setEditingNotes(true)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Add Notes
            </Button>
          </div>
        ) : null
      )}
    </div>
  );
};

export default BeatItem;
