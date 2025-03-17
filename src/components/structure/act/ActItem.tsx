
import React from 'react';
import { Act, Beat } from '@/lib/models/structureModel';
import { Card } from '@/components/ui/card';
import { ActHeader } from './ActHeader';
import { ActContent } from './ActContent';

interface ActItemProps {
  act: Act;
  expandedActs: Record<string, boolean>;
  toggleActExpansion: (actId: string) => void;
  handleEditAct: (act: Act) => void;
  handleDeleteAct: (actId: string) => void;
  handleAddBeat: (act: Act) => void;
  handleEditBeat: (act: Act, beat: Beat) => void;
  handleDeleteBeat: (actId: string, beatId: string) => void;
  editingAct: Act | null;
  setEditingAct: (act: Act | null) => void;
  handleSaveAct: () => void;
  editingBeat: { act: Act, beat: Beat } | null;
  sensors: any;
  handleSaveBeat?: (updatedBeat: Beat) => void;
  handleCancelEditBeat?: () => void;
}

export const ActItem: React.FC<ActItemProps> = ({
  act,
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
  handleSaveBeat,
  handleCancelEditBeat
}) => {
  const isExpanded = expandedActs[act.id];
  
  return (
    <Card 
      key={act.id} 
      className="border-l-4 overflow-hidden transition-all duration-200 hover:shadow-md mb-4"
      style={{ borderLeftColor: act.colorHex }}
    >
      <ActHeader 
        act={act}
        isExpanded={isExpanded}
        toggleActExpansion={() => toggleActExpansion(act.id)}
        handleEditAct={handleEditAct}
        handleDeleteAct={handleDeleteAct}
      />

      {isExpanded && (
        <ActContent 
          act={act}
          isExpanded={isExpanded}
          editingAct={editingAct}
          setEditingAct={setEditingAct}
          handleSaveAct={handleSaveAct}
          handleAddBeat={handleAddBeat}
          editingBeat={editingBeat}
          handleEditBeat={handleEditBeat}
          handleDeleteBeat={handleDeleteBeat}
          sensors={sensors}
          handleSaveBeat={handleSaveBeat}
          handleCancelEditBeat={handleCancelEditBeat}
        />
      )}
    </Card>
  );
};
