
import React from 'react';
import { Act, Beat } from '@/lib/models/structureModel';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { ActItem } from './ActItem';

interface ActListProps {
  acts: Act[];
  expandedActs: Record<string, boolean>;
  toggleActExpansion: (actId: string) => void;
  handleEditAct: (act: Act) => void;
  handleDeleteAct: (actId: string) => void;
  handleAddBeat: (act: Act) => void;
  handleEditBeat: (act: Act, beat: Beat) => void;
  handleDeleteBeat: (actId: string, beatId: string) => void;
  editingAct: Act | null;
  setEditingAct: React.Dispatch<React.SetStateAction<Act | null>>;
  handleSaveAct: () => void;
  editingBeat: { act: Act, beat: Beat } | null;
  sensors: any;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const ActList: React.FC<ActListProps> = ({
  acts,
  expandedActs,
  toggleActExpansion,
  handleEditAct,
  handleDeleteAct,
  handleAddBeat,
  handleEditBeat,
  handleDeleteBeat,
  editingAct,
  setEditingAct,
  handleSaveAct,
  editingBeat,
  sensors,
  handleDragEnd
}) => {
  return (
    <DndContext 
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {acts.map((act) => (
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
    </DndContext>
  );
};
