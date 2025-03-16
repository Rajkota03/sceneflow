
import React, { useState, useEffect } from 'react';
import { Structure, Act, Beat } from '@/lib/models/structureModel';
import { 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save } from 'lucide-react';
import { StructureMetadata } from './StructureMetadata';
import { ActItem } from './ActItem';
import { BeatEditor } from './BeatEditor';

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
  const [editingAct, setEditingAct] = useState<Act | null>(null);
  const [editingBeat, setEditingBeat] = useState<{ act: Act, beat: Beat } | null>(null);
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
      <StructureMetadata structure={structure} onChange={onChange} />

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
          <ActItem
            key={act.id}
            act={act}
            expandedActs={expandedActs}
            toggleActExpansion={toggleActExpansion}
            handleEditAct={handleEditAct}
            handleDeleteAct={handleDeleteAct}
            handleAddBeat={handleAddBeat}
            handleEditBeat={handleEditBeat}
            handleDeleteBeat={handleDeleteBeat}
            editingAct={editingAct}
            setEditingAct={setEditingAct}
            handleSaveAct={handleSaveAct}
            editingBeat={editingBeat}
            sensors={sensors}
          />
        ))}
      </div>
    </div>
  );
};

export default StructureEditor;
