
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ThreeActStructure, StoryBeat } from '@/lib/types';
import ActSection from './ActSection';
import { Button } from '@/components/ui/button';
import { Loader, AlertTriangle, Save, Edit, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  onUpdateProjectTitle?: (title: string) => void;
}

const ThreeActStructureTimeline: React.FC<Props> = ({
  structure,
  isLoading,
  isSaving,
  onUpdateBeat,
  onReorderBeats,
  onUpdateProjectTitle
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(structure?.projectTitle || '');
  
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
      const updatedBeats = newBeats.map((beat, index) => ({
        ...beat,
        position: index
      }));
      onReorderBeats(updatedBeats);
    }
  };

  const handleSaveTitle = () => {
    if (onUpdateProjectTitle && projectTitle.trim()) {
      onUpdateProjectTitle(projectTitle);
    }
    setIsEditingTitle(false);
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
          Unable to load the story structure for this project.
        </p>
        <Button>Create Structure</Button>
      </div>
    );
  }
  
  // Ensure structure.beats exists before filtering
  const beats = structure.beats || [];
  
  // Group beats by act
  const act1Beats = beats.filter(beat => beat.actNumber === 1).sort((a, b) => a.position - b.position);
  const act2ABeats = beats.filter(beat => beat.actNumber === '2A').sort((a, b) => a.position - b.position);
  const midpointBeat = beats.filter(beat => beat.actNumber === 'midpoint' || beat.isMidpoint);
  const act2BBeats = beats.filter(beat => beat.actNumber === '2B').sort((a, b) => a.position - b.position);
  const act3Beats = beats.filter(beat => beat.actNumber === 3).sort((a, b) => a.position - b.position);
  
  return (
    <div className="bg-gray-50 rounded-md p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-800">Four-Part Story Structure</h2>
          {structure.projectTitle && !isEditingTitle ? (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-1">|</span>
              <span className="text-sm font-medium mr-1">{structure.projectTitle}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsEditingTitle(true)}
              >
                <Edit size={12} className="text-gray-600" />
              </Button>
            </div>
          ) : isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="h-8 text-sm w-48"
                placeholder="Project title"
              />
              <Button 
                size="sm" 
                className="h-8"
                onClick={handleSaveTitle}
              >
                Save
              </Button>
            </div>
          ) : null}
        </div>
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
            items={beats.map(beat => beat.id)}
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
                actNumber={'2A'}
                title="Act 2A: Rising Action"
                beats={act2ABeats}
                onUpdateBeat={onUpdateBeat}
              />
              
              {/* Midpoint Section - Specially highlighted */}
              <div className="relative mb-4 z-20">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-yellow-500"></div>
                <div className="flex justify-center">
                  <div className="bg-yellow-500 text-white px-6 py-1 rounded-full text-sm font-bold z-10 flex items-center shadow-md">
                    <Bookmark className="h-4 w-4 mr-1" /> 
                    Midpoint (50%)
                  </div>
                </div>
                <ActSection 
                  actNumber={'midpoint'}
                  title="Midpoint: Major Turning Point"
                  beats={midpointBeat}
                  onUpdateBeat={onUpdateBeat}
                />
              </div>
              
              <ActSection 
                actNumber={'2B'}
                title="Act 2B: Complications"
                beats={act2BBeats}
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
