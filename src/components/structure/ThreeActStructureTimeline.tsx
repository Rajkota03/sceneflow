
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ThreeActStructure, StoryBeat } from '@/lib/types';
import ActSection from './ActSection';
import { Button } from '@/components/ui/button';
import { Loader, AlertTriangle, Save } from 'lucide-react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

interface Props {
  structure: ThreeActStructure | null;
  isLoading: boolean;
  isSaving: boolean;
  onUpdateBeat: (beatId: string, updates: Partial<StoryBeat>) => void;
  onReorderBeats: (beats: StoryBeat[]) => void;
}

const ThreeActStructureTimeline: React.FC<Props> = ({
  structure,
  isLoading,
  isSaving,
  onUpdateBeat,
  onReorderBeats
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    
    if (!over || active.id === over.id || !structure) return;
    
    const oldIndex = structure.beats.findIndex(beat => beat.id === active.id);
    const newIndex = structure.beats.findIndex(beat => beat.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newBeats = arrayMove(structure.beats, oldIndex, newIndex);
      onReorderBeats(newBeats);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
        <p className="text-sm text-gray-600">Loading story structure...</p>
      </div>
    );
  }
  
  if (!structure) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 border rounded-md p-8">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Structure not found</h3>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Unable to load the three-act structure for this project.
        </p>
        <Button>Create Structure</Button>
      </div>
    );
  }
  
  // Group beats by act
  const act1Beats = structure.beats.filter(beat => beat.actNumber === 1).sort((a, b) => a.position - b.position);
  const act2Beats = structure.beats.filter(beat => beat.actNumber === 2).sort((a, b) => a.position - b.position);
  const act3Beats = structure.beats.filter(beat => beat.actNumber === 3).sort((a, b) => a.position - b.position);
  
  return (
    <div className="bg-gray-50 rounded-md p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Three-Act Structure</h2>
        <div className="flex items-center">
          {isSaving && (
            <span className="flex items-center text-sm text-gray-600 mr-3">
              <Loader className="animate-spin h-4 w-4 mr-1" />
              Saving...
            </span>
          )}
          <Button size="sm" className="text-xs">
            <Save className="h-4 w-4 mr-1" />
            Save Structure
          </Button>
        </div>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-300 z-0" />
        
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={structure.beats.map(beat => beat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="relative z-10">
              <ActSection 
                actNumber={1}
                title="Act 1: Setup"
                beats={act1Beats}
                onUpdateBeat={onUpdateBeat}
              />
              
              <ActSection 
                actNumber={2}
                title="Act 2: Confrontation"
                beats={act2Beats}
                onUpdateBeat={onUpdateBeat}
              />
              
              <ActSection 
                actNumber={3}
                title="Act 3: Resolution"
                beats={act3Beats}
                onUpdateBeat={onUpdateBeat}
              />
            </div>
          </SortableContext>
        </DndContext>
      </div>
      
      <div className="mt-6 text-xs text-center text-gray-500">
        Drag items to reorder or click the edit button to customize beat details
      </div>
    </div>
  );
};

export default ThreeActStructureTimeline;
