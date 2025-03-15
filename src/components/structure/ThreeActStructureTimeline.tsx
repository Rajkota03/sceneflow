import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import {
  ThreeActStructure,
  StoryBeat,
  ActType
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, GripVertical, Edit, Trash2, X, Loader } from 'lucide-react';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import StructureHeader from './StructureHeader';
import { SortableItem } from './SortableItem';

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
  const [newBeatName, setNewBeatName] = useState('');
  const [selectedBeat, setSelectedBeat] = useState<StoryBeat | null>(null);
  const [editedBeatName, setEditedBeatName] = useState('');
  const [editedBeatDescription, setEditedBeatDescription] = useState('');
  const [editMode, setEditMode] = useState<'view' | 'edit'>('view');
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
        const { data, error } = await supabase
          .from('structures')
          .select('*')
          .eq('id', structureId)
          .eq('author_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching structure:', error);
          toast({
            title: 'Error loading structure',
            description: error.message,
            variant: 'destructive',
          });
          navigate('/dashboard?tab=structures');
        } else if (data) {
          const formattedStructure: ThreeActStructure = {
            id: data.id,
            projectId: data.project_id || '',
            projectTitle: data.title,
            authorId: data.author_id,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            beats: data.beats as StoryBeat[],
          };

          setStructure(formattedStructure);
          setBeats(formattedStructure.beats || []);
          setTitle(formattedStructure.projectTitle || '');
        }
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
  }, [structureId, session, navigate, propStructure]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleNewBeatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBeatName(e.target.value);
  };

  const handleAddBeat = async () => {
    if (!structure) return;

    const newBeat: StoryBeat = {
      id: uuidv4(),
      title: newBeatName,
      description: '',
      position: beats.length,
      actNumber: 1 as ActType,
    };

    const updatedBeats = [...beats, newBeat];
    setBeats(updatedBeats);
    setNewBeatName('');

    if (onReorderBeats) {
      onReorderBeats(updatedBeats);
    } else {
      await updateStructureBeats(updatedBeats);
    }
  };

  const handleBeatClick = (beat: StoryBeat) => {
    if (mode === 'tag' && onSelectBeatForTagging) {
      onSelectBeatForTagging(beat);
      return;
    }

    setSelectedBeat(beat);
    setEditedBeatName(beat.title);
    setEditedBeatDescription(beat.description);
    setEditMode('view');
  };

  const handleEditBeatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedBeatName(e.target.value);
  };

  const handleEditBeatDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedBeatDescription(e.target.value);
  };

  const handleUpdateBeat = async () => {
    if (!selectedBeat || !structure) return;

    const updatedBeats = beats.map(beat =>
      beat.id === selectedBeat.id ? { ...beat, title: editedBeatName, description: editedBeatDescription } : beat
    );

    setBeats(updatedBeats);
    setSelectedBeat({ ...selectedBeat, title: editedBeatName, description: editedBeatDescription });
    setEditMode('view');

    if (onUpdateBeat) {
      onUpdateBeat(selectedBeat.id, { title: editedBeatName, description: editedBeatDescription });
    } else {
      await updateStructureBeats(updatedBeats);
    }
  };

  const handleDeleteBeat = async () => {
    if (!selectedBeat || !structure) return;

    const updatedBeats = beats.filter(beat => beat.id !== selectedBeat.id);
    setBeats(updatedBeats);
    setSelectedBeat(null);
    setEditMode('view');

    if (onDeleteBeat) {
      onDeleteBeat(selectedBeat.id);
    } else {
      await updateStructureBeats(updatedBeats);
    }
  };

  const handleCancelEdit = () => {
    if (!selectedBeat) return;
    setEditedBeatName(selectedBeat.title);
    setEditedBeatDescription(selectedBeat.description);
    setEditMode('view');
  };

  const updateStructureBeats = async (updatedBeats: StoryBeat[]) => {
    if (!structure) return;

    try {
      const { error } = await supabase
        .from('structures')
        .update({
          beats: updatedBeats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', structure.id);

      if (error) {
        console.error('Error updating structure beats:', error);
        toast({
          title: 'Error updating structure',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Structure updated',
          description: 'The structure has been updated successfully.',
        });
      }
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
      const { error } = await supabase
        .from('structures')
        .update({
          title: title,
          updated_at: new Date().toISOString(),
        })
        .eq('id', structure.id);

      if (error) {
        console.error('Error updating structure title:', error);
        toast({
          title: 'Error updating structure',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Structure updated',
          description: 'The structure has been updated successfully.',
        });
      }
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
          <div className="max-w-4xl mx-auto">
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
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Enter new beat name"
                  value={newBeatName}
                  onChange={handleNewBeatNameChange}
                  className="mr-2 bg-white border-gray-300 focus-visible:ring-2 focus-visible:ring-primary"
                />
                <Button onClick={handleAddBeat}><Plus size={16} className="mr-1" /> Add Beat</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Beats</h3>
                <div className="space-y-2">
                  <SortableContext items={beats.map(beat => beat.id)} strategy={verticalListSortingStrategy}>
                    {beats.map((beat) => (
                      <SortableItem key={beat.id} id={beat.id}>
                        <div
                          className="bg-gray-50 rounded-md shadow-sm p-3 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleBeatClick(beat)}
                        >
                          <div className="flex items-center">
                            <GripVertical size={16} className="text-gray-400 mr-2 cursor-grab" />
                            <span className="text-gray-700 font-medium">{beat.title}</span>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>
              </div>

              <div>
                {selectedBeat ? (
                  <div className="bg-white rounded-md shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Beat Details</h3>
                    {selectedBeat && editMode === "view" && (
                      <>
                        <div className="mb-2">
                          <label className="block text-gray-600 text-sm font-medium mb-1">Name:</label>
                          <p className="text-gray-800">{selectedBeat.title}</p>
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-600 text-sm font-medium mb-1">Description:</label>
                          <p className="text-gray-800">{selectedBeat.description || 'No description provided.'}</p>
                        </div>
                        <Button onClick={() => setEditMode('edit')} className="w-full justify-center">
                          <Edit size={16} className="mr-2" /> Edit Beat
                        </Button>
                      </>
                    )}

                    {selectedBeat && editMode === "edit" && (
                      <>
                        <div className="mb-2">
                          <label className="block text-gray-600 text-sm font-medium mb-1">Name:</label>
                          <Input
                            type="text"
                            value={editedBeatName}
                            onChange={handleEditBeatNameChange}
                            className="bg-white border-gray-300 focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-600 text-sm font-medium mb-1">Description:</label>
                          <Textarea
                            value={editedBeatDescription}
                            onChange={handleEditBeatDescriptionChange}
                            className="bg-white border-gray-300 focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleUpdateBeat} className="w-1/2 justify-center">
                            Update
                          </Button>
                          <Button onClick={handleDeleteBeat} variant="destructive" className="w-1/2 justify-center">
                            <Trash2 size={16} className="mr-2" /> Delete
                          </Button>
                        </div>
                        <Button onClick={handleCancelEdit} variant="ghost" className="mt-2 w-full justify-center">
                          <X size={16} className="mr-2" /> Cancel
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-md shadow-sm p-4">
                    <p className="text-gray-600">Select a beat to view details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default ThreeActStructureTimeline;
