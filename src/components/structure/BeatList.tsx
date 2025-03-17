
import React from 'react';
import { Act, Beat } from '@/lib/models/structureModel';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { BeatItem } from './BeatItem';

interface BeatListProps {
  act: Act;
  editingBeat: { act: Act, beat: Beat } | null;
  handleEditBeat: (act: Act, beat: Beat) => void;
  handleDeleteBeat: (actId: string, beatId: string) => void;
  sensors: any;
  handleSaveBeat?: (updatedBeat: Beat) => void;
  handleCancelEditBeat?: () => void;
}

export const BeatList: React.FC<BeatListProps> = ({
  act,
  editingBeat,
  handleEditBeat,
  handleDeleteBeat,
  sensors,
  handleSaveBeat,
  handleCancelEditBeat
}) => {
  return (
    <SortableContext
      items={act.beats.map(beat => `${act.id}|${beat.id}`)}
      strategy={verticalListSortingStrategy}
    >
      {act.beats.map((beat) => (
        <SortableItem key={`${act.id}|${beat.id}`} id={`${act.id}|${beat.id}`}>
          <BeatItem 
            act={act}
            beat={beat}
            isEditing={
              editingBeat?.act.id === act.id && 
              editingBeat?.beat.id === beat.id
            }
            onEdit={() => handleEditBeat(act, beat)}
            onDelete={() => handleDeleteBeat(act.id, beat.id)}
            onSave={(updatedBeat) => {
              if (handleSaveBeat) {
                handleSaveBeat(updatedBeat);
              }
            }}
            onCancel={() => {
              if (handleCancelEditBeat) {
                handleCancelEditBeat();
              }
            }}
          />
        </SortableItem>
      ))}
    </SortableContext>
  );
};
