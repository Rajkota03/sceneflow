
import React from 'react';
import { Act, Beat } from '@/lib/models/structureModel';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BeatList } from '../BeatList';
import { ActEditForm } from './ActEditForm';

interface ActContentProps {
  act: Act;
  isExpanded: boolean;
  editingAct: Act | null;
  setEditingAct: (act: Act | null) => void;
  handleSaveAct: () => void;
  handleAddBeat: (act: Act) => void;
  editingBeat: { act: Act, beat: Beat } | null;
  handleEditBeat: (act: Act, beat: Beat) => void;
  handleDeleteBeat: (actId: string, beatId: string) => void;
  sensors: any;
  handleSaveBeat?: (updatedBeat: Beat) => void;
  handleCancelEditBeat?: () => void;
}

export const ActContent: React.FC<ActContentProps> = ({
  act,
  isExpanded,
  editingAct,
  setEditingAct,
  handleSaveAct,
  handleAddBeat,
  editingBeat,
  handleEditBeat,
  handleDeleteBeat,
  sensors,
  handleSaveBeat,
  handleCancelEditBeat
}) => {
  if (!isExpanded) {
    return null;
  }

  return (
    <CardContent className="pt-4 pb-4 bg-white">
      {editingAct && editingAct.id === act.id ? (
        <ActEditForm 
          editingAct={editingAct} 
          setEditingAct={setEditingAct} 
          handleSaveAct={handleSaveAct} 
        />
      ) : (
        <div className="space-y-2">
          <BeatList 
            act={act}
            editingBeat={editingBeat}
            handleEditBeat={handleEditBeat}
            handleDeleteBeat={handleDeleteBeat}
            sensors={sensors}
            handleSaveBeat={handleSaveBeat}
            handleCancelEditBeat={handleCancelEditBeat}
          />
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
  );
};
