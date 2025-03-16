
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ 
    id,
    animateLayoutChanges: () => false // Disable animation for smoother dragging
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className="transition-shadow mb-2 rounded-lg"
      data-is-dragging={isDragging ? 'true' : undefined}
    >
      <div {...listeners}>
        {children}
      </div>
    </div>
  );
};
