
import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Act, Beat } from '@/lib/types';
import { Button } from '../ui/button';
import { GripVertical, Plus } from 'lucide-react';
import SortableBeatItem from './SortableBeatItem';
import { UniqueIdentifier } from '@dnd-kit/core';
import { cn } from '@/lib/utils'; // Import cn for conditional styling

interface SortableActItemProps {
  act: Act;
  beatIds: UniqueIdentifier[]; // Pass beat IDs for the nested context
  onAddBeat: (actId: string) => void;
  onDeleteBeat: (actId: string, beatId: string) => void;
  isDraggingAct: boolean; // Is this specific act being dragged?
  activeDragId: UniqueIdentifier | null; // ID of the item currently being dragged (could be an act or a beat)
}

const SortableActItem: React.FC<SortableActItemProps> = ({ 
  act, 
  beatIds, 
  onAddBeat, 
  onDeleteBeat, 
  isDraggingAct, 
  activeDragId 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({ id: act.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Apply visual feedback when dragging the act itself
    opacity: isDraggingAct ? 0.5 : 1,
    zIndex: isDraggingAct ? 10 : 'auto',
  };

  // Determine if a beat *within this act* is being dragged
  const isDraggingBeatFromThisAct = beatIds.includes(activeDragId as UniqueIdentifier) && activeDragId !== null;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "mb-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-slate-850 shadow-sm",
        // Add visual cue if dragging over this act (when dragging a beat)
        isOver && !isDraggingAct && !isDraggingBeatFromThisAct && "ring-2 ring-blue-500 ring-offset-1"
      )}
    >
      {/* Act Header with Drag Handle */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {/* Drag handle for the Act */}
          <button {...attributes} {...listeners} className="cursor-grab touch-none mr-2 text-gray-400 hover:text-gray-600">
            <GripVertical size={16} />
          </button>
          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{act.title}</span>
        </div>
        {/* Add Beat Button */}
        <Button variant="ghost" size="sm" onClick={() => onAddBeat(act.id)} className="h-6 px-1">
          <Plus size={14} className="text-gray-500" />
        </Button>
      </div>

      {/* Sortable Beats Section - Nested SortableContext */}
      <div className="pl-6 pr-2 py-2 space-y-1">
        {act.beats && act.beats.length > 0 ? (
          <SortableContext items={beatIds} strategy={verticalListSortingStrategy}>
            {act.beats.map((beat) => (
              <SortableBeatItem 
                key={beat.id} 
                beat={beat} 
                actId={act.id} 
                onDeleteBeat={onDeleteBeat} 
                // Indicate if this specific beat is being dragged
                isDragging={activeDragId === beat.id}
              />
            ))}
          </SortableContext>
        ) : (
          <div className="text-xs text-gray-400 italic">No beats yet. Click '+' to add one.</div>
        )}
      </div>
    </div>
  );
};

export default SortableActItem;

