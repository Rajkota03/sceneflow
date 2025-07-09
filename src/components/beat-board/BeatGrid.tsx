import { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Beat40 {
  id: number;
  title: string;
  type: string;
  summary: string;
  alternatives: Array<{
    summary: string;
    source_id: number;
  }>;
}

interface SortableBeatCardProps {
  beat: Beat40;
  onClick: () => void;
}

function SortableBeatCard({ beat, onClick }: SortableBeatCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: beat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'setup':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'fun and games':
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'bad guys close in':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      case 'finale':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "transition-all duration-200",
        isDragging && "opacity-50 scale-105 z-50"
      )}
    >
      <Card 
        className="hover:shadow-md transition-shadow relative group"
      >
        <div 
          {...listeners}
          className="absolute top-2 right-2 w-4 h-4 opacity-30 group-hover:opacity-100 cursor-move z-10"
        >
          <div className="w-full h-full bg-muted-foreground rounded-sm"></div>
        </div>
        <CardContent 
          className="p-4 space-y-3 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getTypeColor(beat.type))}
              >
                {beat.type}
              </Badge>
              <span className="text-xs text-muted-foreground">#{beat.id}</span>
            </div>
            <h3 className="font-semibold text-sm leading-tight">{beat.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {beat.summary}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{beat.alternatives?.length || 0} alternatives</span>
            <span className="text-xs opacity-50 group-hover:opacity-100">Click for alternatives</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface BeatGridProps {
  beats: Beat40[];
  onBeatClick: (beat: Beat40) => void;
  onReorder: (beats: Beat40[]) => void;
}

export function BeatGrid({ beats, onBeatClick, onReorder }: BeatGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = beats.findIndex((beat) => beat.id === active.id);
      const newIndex = beats.findIndex((beat) => beat.id === over.id);
      
      const newBeats = arrayMove(beats, oldIndex, newIndex);
      onReorder(newBeats);
    }
  }

  if (!beats || beats.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No beats generated yet. Generate some beats to start organizing them!
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={beats.map(beat => beat.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
          {beats.map((beat) => (
            <SortableBeatCard
              key={beat.id}
              beat={beat}
              onClick={() => onBeatClick(beat)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}