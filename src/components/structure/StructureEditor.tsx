
import React, { useState, useEffect } from 'react';
import { Structure, Act, Beat } from '@/lib/models/structureModel';
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
import { SortableItem } from '@/components/structure/SortableItem';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { v4 as uuidv4 } from 'uuid';
import { Edit, Plus, Trash2, Save, MoveVertical } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface StructureEditorProps {
  structure: Structure;
  onChange: (updatedStructure: Structure) => void;
  onSave: (structure: Structure) => Promise<void>;
}

export const StructureEditor: React.FC<StructureEditorProps> = ({ 
  structure, 
  onChange, 
  onSave 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAct, setEditingAct] = useState<Act | null>(null);
  const [editingBeat, setEditingBeat] = useState<{ act: Act, beat: Beat } | null>(null);
  const [newName, setNewName] = useState(structure.name);
  const [newDescription, setNewDescription] = useState(structure.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-save when structure changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isEditing && !editingAct && !editingBeat) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [structure]);

  const handleMetadataChange = () => {
    onChange({
      ...structure,
      name: newName,
      description: newDescription,
    });
    setIsEditing(false);
  };

  const handleAddAct = () => {
    const newAct: Act = {
      id: uuidv4(),
      title: 'New Act',
      colorHex: '#808080',
      startPosition: 0,
      endPosition: 100,
      beats: [],
    };
    
    onChange({
      ...structure,
      acts: [...structure.acts, newAct],
    });
  };

  const handleEditAct = (act: Act) => {
    setEditingAct({ ...act });
  };

  const handleSaveAct = () => {
    if (!editingAct) return;
    
    onChange({
      ...structure,
      acts: structure.acts.map(act => 
        act.id === editingAct.id ? editingAct : act
      ),
    });
    
    setEditingAct(null);
  };

  const handleDeleteAct = (actId: string) => {
    onChange({
      ...structure,
      acts: structure.acts.filter(act => act.id !== actId),
    });
  };

  const handleAddBeat = (act: Act) => {
    const newBeat: Beat = {
      id: uuidv4(),
      title: 'New Beat',
      description: '',
      timePosition: Math.round((act.startPosition + act.endPosition) / 2),
    };
    
    onChange({
      ...structure,
      acts: structure.acts.map(a => 
        a.id === act.id 
          ? { ...a, beats: [...a.beats, newBeat] }
          : a
      ),
    });
  };

  const handleEditBeat = (act: Act, beat: Beat) => {
    setEditingBeat({ act, beat: { ...beat } });
  };

  const handleSaveBeat = () => {
    if (!editingBeat) return;
    
    onChange({
      ...structure,
      acts: structure.acts.map(act => 
        act.id === editingBeat.act.id 
          ? { 
              ...act, 
              beats: act.beats.map(beat => 
                beat.id === editingBeat.beat.id 
                  ? editingBeat.beat 
                  : beat
              ) 
            }
          : act
      ),
    });
    
    setEditingBeat(null);
  };

  const handleDeleteBeat = (actId: string, beatId: string) => {
    onChange({
      ...structure,
      acts: structure.acts.map(act => 
        act.id === actId 
          ? { ...act, beats: act.beats.filter(beat => beat.id !== beatId) }
          : act
      ),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      const actId = active.id.toString().split('-')[0];
      const act = structure.acts.find(a => a.id === actId);
      
      if (!act) return;
      
      const oldIndex = act.beats.findIndex(beat => beat.id === active.id.toString().split('-')[1]);
      const newIndex = act.beats.findIndex(beat => beat.id === over.id.toString().split('-')[1]);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBeats = arrayMove(act.beats, oldIndex, newIndex);
        
        onChange({
          ...structure,
          acts: structure.acts.map(a => 
            a.id === actId 
              ? { ...a, beats: newBeats }
              : a
          ),
        });
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(structure);
      toast({
        title: 'Structure saved',
        description: 'Your structure has been saved successfully',
      });
    } catch (error) {
      console.error('Error saving structure:', error);
      toast({
        title: 'Error saving structure',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="w-full space-y-4">
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Structure name"
              className="text-xl font-bold"
            />
            <Textarea 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)} 
              placeholder="Structure description"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleMetadataChange}>Save</Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold">{structure.name}</h1>
              {structure.description && (
                <p className="text-muted-foreground mt-1">{structure.description}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setNewName(structure.name);
              setNewDescription(structure.description || '');
              setIsEditing(true);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Acts & Beats</h2>
        <div className="flex space-x-2">
          <Button onClick={handleAddAct} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Act
          </Button>
          <Button onClick={handleSave} size="sm" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Structure
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {structure.acts.map((act) => (
          <Card key={act.id} className="border-l-4" style={{ borderLeftColor: act.colorHex }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{act.title}</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditAct(act)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => handleDeleteAct(act.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {act.startPosition}% - {act.endPosition}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingAct && editingAct.id === act.id ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="act-title" className="block text-sm font-medium mb-1">
                      Act Title
                    </label>
                    <Input 
                      id="act-title"
                      value={editingAct.title} 
                      onChange={(e) => setEditingAct({ ...editingAct, title: e.target.value })} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="act-start" className="block text-sm font-medium mb-1">
                        Start Position (%)
                      </label>
                      <Input 
                        id="act-start"
                        type="number"
                        min="0"
                        max="100"
                        value={editingAct.startPosition} 
                        onChange={(e) => setEditingAct({ 
                          ...editingAct, 
                          startPosition: Number(e.target.value) 
                        })} 
                      />
                    </div>
                    <div>
                      <label htmlFor="act-end" className="block text-sm font-medium mb-1">
                        End Position (%)
                      </label>
                      <Input 
                        id="act-end"
                        type="number"
                        min="0"
                        max="100"
                        value={editingAct.endPosition} 
                        onChange={(e) => setEditingAct({ 
                          ...editingAct, 
                          endPosition: Number(e.target.value) 
                        })} 
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="act-color" className="block text-sm font-medium mb-1">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      <Input 
                        id="act-color"
                        type="color"
                        value={editingAct.colorHex} 
                        onChange={(e) => setEditingAct({ ...editingAct, colorHex: e.target.value })} 
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        value={editingAct.colorHex} 
                        onChange={(e) => setEditingAct({ ...editingAct, colorHex: e.target.value })} 
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingAct(null)}>Cancel</Button>
                    <Button onClick={handleSaveAct}>Save</Button>
                  </div>
                </div>
              ) : (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={act.beats.map(beat => `${act.id}-${beat.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {act.beats.map((beat) => (
                        <SortableItem key={`${act.id}-${beat.id}`} id={`${act.id}-${beat.id}`}>
                          <div className="border rounded-md p-3 bg-white hover:bg-gray-50 transition-colors">
                            {editingBeat && editingBeat.act.id === act.id && editingBeat.beat.id === beat.id ? (
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="beat-title" className="block text-sm font-medium mb-1">
                                    Beat Title
                                  </label>
                                  <Input 
                                    id="beat-title"
                                    value={editingBeat.beat.title} 
                                    onChange={(e) => setEditingBeat({
                                      ...editingBeat,
                                      beat: { ...editingBeat.beat, title: e.target.value }
                                    })} 
                                  />
                                </div>
                                <div>
                                  <label htmlFor="beat-description" className="block text-sm font-medium mb-1">
                                    Description
                                  </label>
                                  <Textarea 
                                    id="beat-description"
                                    value={editingBeat.beat.description} 
                                    onChange={(e) => setEditingBeat({
                                      ...editingBeat,
                                      beat: { ...editingBeat.beat, description: e.target.value }
                                    })} 
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label htmlFor="beat-position" className="block text-sm font-medium mb-1">
                                    Time Position (%)
                                  </label>
                                  <Input 
                                    id="beat-position"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editingBeat.beat.timePosition} 
                                    onChange={(e) => setEditingBeat({
                                      ...editingBeat,
                                      beat: { ...editingBeat.beat, timePosition: Number(e.target.value) }
                                    })} 
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setEditingBeat(null)}>Cancel</Button>
                                  <Button onClick={handleSaveBeat}>Save</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <MoveVertical className="h-4 w-4 text-muted-foreground mr-2" />
                                  <div>
                                    <h4 className="font-medium">{beat.title}</h4>
                                    <div className="flex items-center space-x-2">
                                      <p className="text-sm text-muted-foreground">{beat.timePosition}%</p>
                                      {beat.description && (
                                        <>
                                          <span className="text-muted-foreground">•</span>
                                          <p className="text-sm text-muted-foreground line-clamp-1">{beat.description}</p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleEditBeat(act, beat)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive"
                                    onClick={() => handleDeleteBeat(act.id, beat.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              
              {(!editingAct || editingAct.id !== act.id) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => handleAddBeat(act)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Beat
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StructureEditor;
