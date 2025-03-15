
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  ThreeActStructure,
  StoryBeat,
  ActType
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '@/App';
import StructureHeader from './StructureHeader';
import { SortableItem } from './SortableItem';
import ActSection from './ActSection';

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

  const beatsByAct = beats.reduce((acc, beat) => {
    const actNumber = beat.actNumber;
    if (!acc[actNumber]) {
      acc[actNumber] = [];
    }
    acc[actNumber].push(beat);
    return acc;
  }, {} as Record<ActType | string, StoryBeat[]>);

  const ensureAllActs = () => {
    const allActs: ActType[] = [1, '2A', 'midpoint', '2B', 3];
    const result = [];
    
    for (const act of allActs) {
      const beatsForAct = beatsByAct[act] || [];
      result.push({
        act,
        beats: beatsForAct.sort((a, b) => a.position - b.position)
      });
    }
    
    return result;
  };

  const sortedBeatsByAct = ensureAllActs();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
          <p className="text-slate-600">Loading structure...</p>
        </div>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-xl font-medium text-slate-900 mb-4">Structure not found</p>
          <Button onClick={() => navigate('/dashboard?tab=structures')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-slate-100">
        <StructureHeader title={title} projectId={projectId} />

        <div className="flex-grow overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  <Input
                    type="text"
                    placeholder="Enter structure title"
                    value={title}
                    onChange={handleTitleChange}
                    onBlur={handleUpdateTitle}
                    className="text-xl font-semibold text-gray-800 bg-white border-gray-300 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </h2>
                {onSave && (
                  <Button onClick={onSave}>Save</Button>
                )}
              </div>
            </div>

            <SortableContext items={beats.map(beat => beat.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-8">
                {/* Act 1 */}
                <ActSection
                  actNumber={1}
                  title="Act 1 - Setup"
                  beats={sortedBeatsByAct.find(item => item.act === 1)?.beats || []}
                  onUpdateBeat={onUpdateBeat || (() => {})}
                  onDeleteBeat={onDeleteBeat}
                  onBeatClick={handleBeatClick}
                  taggingMode={mode === 'tag'}
                />
                
                {/* Act 2A */}
                <ActSection
                  actNumber="2A"
                  title="Act 2A - Confrontation (First Half)"
                  beats={sortedBeatsByAct.find(item => item.act === '2A')?.beats || []}
                  onUpdateBeat={onUpdateBeat || (() => {})}
                  onDeleteBeat={onDeleteBeat}
                  onBeatClick={handleBeatClick}
                  taggingMode={mode === 'tag'}
                />
                
                {/* Midpoint */}
                <ActSection
                  actNumber="midpoint"
                  title="Midpoint"
                  beats={sortedBeatsByAct.find(item => item.act === 'midpoint')?.beats || []}
                  onUpdateBeat={onUpdateBeat || (() => {})}
                  onDeleteBeat={onDeleteBeat}
                  onBeatClick={handleBeatClick}
                  taggingMode={mode === 'tag'}
                />
                
                {/* Act 2B */}
                <ActSection
                  actNumber="2B"
                  title="Act 2B - Confrontation (Second Half)"
                  beats={sortedBeatsByAct.find(item => item.act === '2B')?.beats || []}
                  onUpdateBeat={onUpdateBeat || (() => {})}
                  onDeleteBeat={onDeleteBeat}
                  onBeatClick={handleBeatClick}
                  taggingMode={mode === 'tag'}
                />
                
                {/* Act 3 */}
                <ActSection
                  actNumber={3}
                  title="Act 3 - Resolution"
                  beats={sortedBeatsByAct.find(item => item.act === 3)?.beats || []}
                  onUpdateBeat={onUpdateBeat || (() => {})}
                  onDeleteBeat={onDeleteBeat}
                  onBeatClick={handleBeatClick}
                  taggingMode={mode === 'tag'}
                />
              </div>
            </SortableContext>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default ThreeActStructureTimeline;
