
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Beat } from '@/lib/types';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils'; // Import cn

interface SortableBeatItemProps {
  beat: Beat;
  actId: string; // ID of the parent act
  onDeleteBeat: (actId: string, beatId: string) => void;
  isDragging: boolean; // Is this specific beat being dragged?
  // Add props for editing later
}

const SortableBeatItem: React.FC<SortableBeatItemProps> = ({ beat, actId, onDeleteBeat, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({ id: beat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Apply visual feedback when dragging this beat
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : 'auto', // Ensure dragged beat is on top of other beats/acts
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 shadow-sm",
        // Add visual cue if dragging over this beat
        isOver && !isDragging && "ring-1 ring-blue-400"
      )}
    >
      <div className="flex items-center overflow-hidden">
        {/* Drag Handle */}
        <button {...attributes} {...listeners} className="cursor-grab touch-none mr-1.5 text-gray-400 hover:text-gray-600 flex-shrink-0">
          <GripVertical size={14} />
        </button>
        {/* Beat Title */}
        <span className="text-xs text-gray-700 dark:text-gray-300 truncate" title={beat.title}>{beat.title}</span>
      </div>
      {/* Delete Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onDeleteBeat(actId, beat.id)} 
        className="h-5 px-1 flex-shrink-0"
      >
        <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
      </Button>
    </div>
  );
};

export default SortableBeatItem;

