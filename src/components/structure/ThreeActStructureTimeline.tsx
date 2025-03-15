
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ThreeActStructure, StoryBeat, ActType } from '@/lib/types';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';
import StructureHeader from './StructureHeader';
import { LoadingState, NotFoundState } from './StructureStates';
import StructureTitleEditor from './StructureTitleEditor';
import StructureActSections from './StructureActSections';
import useStructureBeatsOrganizer from '@/hooks/useStructureBeatsOrganizer';

interface ThreeActStructureTimelineProps {
  projectId?: string;
  structure?: ThreeActStructure | null;
  isLoading?: boolean;
  isSaving?: boolean;
  onUpdateBeat?: (beatId: string, updates: Partial<StoryBeat>) => void;
  onReorderBeats?: (beats: StoryBeat[]) => void;
  onUpdateProjectTitle?: (title: string) => void;
  onDeleteBeat?: (beatId: string) => void;
  onSave?: () => void;
  mode?: 'edit' | 'tag';
  onSelectBeatForTagging?: (beat: StoryBeat) => void;
}

const ThreeActStructureTimeline: React.FC<ThreeActStructureTimelineProps> = ({ 
  projectId,
  structure: propStructure,
  isLoading: propIsLoading,
  isSaving: propIsSaving,
  onUpdateBeat,
  onReorderBeats,
  onUpdateProjectTitle,
  onDeleteBeat,
  onSave,
  mode = 'edit',
  onSelectBeatForTagging
}) => {
  const { structureId } = useParams<{ structureId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [structure, setStructure] = useState<ThreeActStructure | null>(propStructure || null);
  const [beats, setBeats] = useState<StoryBeat[]>([]);
  const [title, setTitle] = useState('');
  const [selectedBeat, setSelectedBeat] = useState<StoryBeat | null>(null);
  const [isLoading, setIsLoading] = useState(propIsLoading !== undefined ? propIsLoading : true);

  // Extract the beats organization logic to a custom hook
  const { organizedBeats } = useStructureBeatsOrganizer(beats);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (propStructure) {
      setStructure(propStructure);
      setBeats(propStructure.beats || []);
      setTitle(propStructure.projectTitle || '');
      return;
    }

    if (!session || !structureId) return;

    const fetchStructure = async () => {
      setIsLoading(true);
      try {
        const mockStructureData = {
          id: structureId,
          projectTitle: 'My Story Structure',
          projectId: projectId || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          beats: [] as StoryBeat[]
        };
        
        setStructure(mockStructureData);
        setBeats(mockStructureData.beats);
        setTitle(mockStructureData.projectTitle);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load the structure. Please try again.',
          variant: 'destructive',
        });
        navigate('/dashboard?tab=structures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStructure();
  }, [structureId, session, navigate, propStructure, projectId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);

  const handleBeatClick = (beat: StoryBeat) => {
    if (mode === 'tag' && onSelectBeatForTagging) {
      onSelectBeatForTagging(beat);
      return;
    }

    setSelectedBeat(beat);
  };

  const updateStructureBeats = async (updatedBeats: StoryBeat[]) => {
    if (!structure) return;

    try {
      console.log('Updated structure beats:', updatedBeats);
      toast({
        title: 'Structure updated',
        description: 'The structure has been updated successfully.',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the structure. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTitle = async () => {
    if (!structure) return;

    if (onUpdateProjectTitle) {
      onUpdateProjectTitle(title);
      return;
    }

    try {
      console.log('Updated structure title:', title);
      toast({
        title: 'Structure updated',
        description: 'The structure has been updated successfully.',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the structure. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = beats.findIndex(beat => beat.id === active.id);
      const newIndex = beats.findIndex(beat => beat.id === over.id);
      
      const newBeats = arrayMove(beats, oldIndex, newIndex).map((beat, index) => ({
        ...beat,
        position: index
      }));
      
      setBeats(newBeats);
      
      if (onReorderBeats) {
        onReorderBeats(newBeats);
      } else {
        updateStructureBeats(newBeats);
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show not found state
  if (!structure) {
    return <NotFoundState />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col bg-slate-50 rounded-lg shadow-sm">
        <StructureHeader title={title} projectId={projectId} />

        <div className="p-6">
          <StructureTitleEditor
            title={title}
            onTitleChange={handleTitleChange}
            onTitleBlur={handleUpdateTitle}
            onSave={onSave}
            isSaving={propIsSaving}
          />

          <div className="mt-6 relative timeline-container">
            {/* Timeline line that connects all sections */}
            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-gray-300 h-full top-0 z-0"></div>
            
            <StructureActSections
              beats={beats}
              actBeats={organizedBeats}
              onUpdateBeat={onUpdateBeat || (() => {})}
              onDeleteBeat={onDeleteBeat}
              onBeatClick={handleBeatClick}
              taggingMode={mode === 'tag'}
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default ThreeActStructureTimeline;
