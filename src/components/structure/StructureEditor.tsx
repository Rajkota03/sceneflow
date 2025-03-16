
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';
import { Edit, Plus, Trash2, Save, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface StructureEditorProps {
  structure: Structure;
  onChange: (updatedStructure: Structure) => void;
  onSave: (structure: Structure) => Promise<void>;
  isSaving?: boolean;
}

const StructureEditor: React.FC<StructureEditorProps> = ({ 
  structure, 
  onChange, 
  onSave,
  isSaving = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAct, setEditingAct] = useState<Act | null>(null);
  const [editingBeat, setEditingBeat] = useState<{ act: Act, beat: Beat } | null>(null);
  const [newName, setNewName] = useState(structure.name);
  const [newDescription, setNewDescription] = useState(structure.description || '');
  const [expandedActs, setExpandedActs] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require the pointer to move by 5px before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize expanded acts on first load
  useEffect(() => {
    if (structure?.acts && Object.keys(expandedActs).length === 0) {
      const initialExpanded: Record<string, boolean> = {};
      structure.acts.forEach(act => {
        initialExpanded[act.id] = true;
      });
      setExpandedActs(initialExpanded);
    }
  }, [structure?.acts]);

  const toggleActExpansion = (actId: string) => {
    setExpandedActs(prev => ({
      ...prev,
      [actId]: !prev[actId]
    }));
  };

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

    // Auto-expand new act
    setExpandedActs(prev => ({
      ...prev,
      [newAct.id]: true
    }));
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
      const activeId = String(active.id);
      const overId = String(over.id);
      
      // Extract actId and beatId from the combined id (actId|beatId)
      const [activeActId, activeBeatId] = activeId.split('|');
      const [overActId, overBeatId] = overId.split('|');
      
      // Only allow sorting within the same act
      if (activeActId === overActId) {
        const act = structure.acts.find(a => a.id === activeActId);
        
        if (!act) return;
        
        const oldIndex = act.beats.findIndex(beat => beat.id === activeBeatId);
        const newIndex = act.beats.findIndex(beat => beat.id === overBeatId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newBeats = arrayMove(act.beats, oldIndex, newIndex);
          
          onChange({
            ...structure,
            acts: structure.acts.map(a => 
              a.id === activeActId 
                ? { ...a, beats: newBeats }
                : a
            ),
          });
        }
      }
    }
  };

  const handleSave = async () => {
    try {
      await onSave(structure);
    } catch (error) {
      console.error('Error saving structure:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-6 rounded-xl shadow-sm border border-slate-100">
        {isEditing ? (
          <div className="w-full space-y-4">
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Structure name"
              className="text-xl font-bold border-slate-200 focus:border-primary/50 transition-all"
            />
            <Textarea 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)} 
              placeholder="Structure description"
              rows={3}
              className="border-slate-200 focus:border-primary/50 transition-all"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleMetadataChange}>Save</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {structure.name}
                </h1>
                {structure.description && (
                  <p className="text-slate-600 mt-2 max-w-2xl">{structure.description}</p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-600 hover:text-primary hover:bg-slate-100 transition-all" 
                onClick={() => {
                  setNewName(structure.name);
                  setNewDescription(structure.description || '');
                  setIsEditing(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-4">
        <h2 className="text-xl font-semibold text-slate-800">Acts & Beats</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={handleAddAct} 
            variant="outline" 
            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Act
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Structure'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {structure.acts.map((act) => (
          <Card 
            key={act.id} 
            className="border-l-4 overflow-hidden transition-all duration-200 hover:shadow-md"
            style={{ borderLeftColor: act.colorHex }}
          >
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleActExpansion(act.id)}
            >
              <div className="flex items-center">
                {expandedActs[act.id] ? 
                  <ChevronUp className="h-5 w-5 mr-3 text-slate-400" /> : 
                  <ChevronDown className="h-5 w-5 mr-3 text-slate-400" />
                }
                <div>
                  <CardTitle className="text-lg font-medium text-slate-800">{act.title}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Pages: <span className="font-medium">TBD</span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-slate-100 text-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAct(act);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAct(act.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandedActs[act.id] && (
              <CardContent className="pt-0 pb-4">
                {editingAct && editingAct.id === act.id ? (
                  <div className="space-y-4 bg-slate-50 p-4 rounded-lg mt-4 border border-slate-100">
                    <div>
                      <label htmlFor="act-title" className="block text-sm font-medium text-slate-700 mb-1">
                        Act Title
                      </label>
                      <Input 
                        id="act-title"
                        value={editingAct.title} 
                        onChange={(e) => setEditingAct({ ...editingAct, title: e.target.value })} 
                        className="border-slate-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="act-color" className="block text-sm font-medium text-slate-700 mb-1">
                        Color
                      </label>
                      <div className="flex space-x-2">
                        <Input 
                          id="act-color"
                          type="color"
                          value={editingAct.colorHex} 
                          onChange={(e) => setEditingAct({ ...editingAct, colorHex: e.target.value })} 
                          className="w-16 h-10 p-1 border-slate-200"
                        />
                        <Input 
                          value={editingAct.colorHex} 
                          onChange={(e) => setEditingAct({ ...editingAct, colorHex: e.target.value })} 
                          maxLength={7}
                          className="border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingAct(null)}
                        className="border-slate-200"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveAct}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 mt-4">
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={act.beats.map(beat => `${act.id}|${beat.id}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {act.beats.map((beat) => (
                          <SortableItem key={`${act.id}|${beat.id}`} id={`${act.id}|${beat.id}`}>
                            <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors group">
                              {editingBeat && editingBeat.act.id === act.id && editingBeat.beat.id === beat.id ? (
                                <div className="space-y-4">
                                  <div>
                                    <label htmlFor="beat-title" className="block text-sm font-medium text-slate-700 mb-1">
                                      Beat Title
                                    </label>
                                    <Input 
                                      id="beat-title"
                                      value={editingBeat.beat.title} 
                                      onChange={(e) => setEditingBeat({
                                        ...editingBeat,
                                        beat: { ...editingBeat.beat, title: e.target.value }
                                      })} 
                                      className="border-slate-200"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="beat-description" className="block text-sm font-medium text-slate-700 mb-1">
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
                                      className="border-slate-200 min-h-[80px]"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setEditingBeat(null)}
                                      className="border-slate-200"
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSaveBeat}>Save</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between group">
                                  <div className="flex items-center flex-1">
                                    <GripVertical className="h-5 w-5 text-slate-400 mr-3 cursor-move opacity-50 group-hover:opacity-100" />
                                    <div className="flex-1">
                                      <div className="flex items-center mb-1">
                                        <h4 className="font-medium text-slate-800">{beat.title}</h4>
                                        <span className="ml-2 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                          Page TBD
                                        </span>
                                      </div>
                                      {beat.description && (
                                        <p className="text-sm text-slate-600">{beat.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditBeat(act, beat);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 text-slate-600" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBeat(act.id, beat.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </SortableItem>
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
                
                {(!editingAct || editingAct.id !== act.id) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 bg-white border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                    onClick={() => handleAddBeat(act)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Beat
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StructureEditor;
