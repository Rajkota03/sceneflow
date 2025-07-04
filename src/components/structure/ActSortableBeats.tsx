
import React from 'react';
import { Act, Beat } from '@/lib/types';
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import BeatItem from './BeatItem';

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
      const oldIndex = act.beats?.findIndex(beat => beat.id === active.id) ?? -1;
      const newIndex = act.beats?.findIndex(beat => beat.id === over.id) ?? -1;
      
      if (oldIndex === -1 || newIndex === -1 || !act.beats) return;
      
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
        items={act.beats?.map(beat => beat.id) || []}
        strategy={verticalListSortingStrategy}
      >
        {act.beats?.map(beat => {
          const isMidpoint = act.title.toLowerCase().includes('midpoint') && 
            beat.title.toLowerCase().includes('midpoint');
          
          return (
            <BeatItem
              key={beat.id}
              act={act}
              beat={beat}
              isMidpoint={isMidpoint}
              onBeatToggleComplete={onBeatToggleComplete}
              onBeatUpdate={onBeatUpdate}
              isEditing={isEditing}
            />
          );
        }) || []}
      </SortableContext>
    </DndContext>
  );
};

export default ActSortableBeats;
