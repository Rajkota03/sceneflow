import React, { useState } from 'react';
import { Act, Beat } from '@/lib/models/structureModel';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, FileText } from 'lucide-react';
import { BeatList } from './BeatList';

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
  // Count beats in this act for the badge display
  const beatCount = act.beats.length;
  
  // Convert percentage to estimated page count (assuming 1% = 1.2 pages in a 120-page screenplay)
  const getEstimatedPageCount = (percentage: number) => {
    return Math.round((percentage / 100) * 120);
  };
  
  const startPage = getEstimatedPageCount(act.startPosition);
  const endPage = getEstimatedPageCount(act.endPosition);
  
  return (
    <Card 
      key={act.id} 
      className="border-l-4 overflow-hidden transition-all duration-200 hover:shadow-md mb-4"
      style={{ borderLeftColor: act.colorHex }}
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer bg-slate-50"
        onClick={() => toggleActExpansion(act.id)}
      >
        <div className="flex items-center">
          {expandedActs[act.id] ? 
            <ChevronUp className="h-5 w-5 mr-3 text-slate-400" /> : 
            <ChevronDown className="h-5 w-5 mr-3 text-slate-400" />
          }
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800">{act.title}</CardTitle>
            <div className="flex items-center mt-1">
              <span className="flex items-center text-sm text-slate-500 mr-2">
                <FileText className="h-3 w-3 mr-1" />
                Pages {startPage}-{endPage}
              </span>
              {beatCount > 0 && (
                <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                  {beatCount} Beat{beatCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
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
      )}
    </Card>
  );
};

interface ActEditFormProps {
  editingAct: Act;
  setEditingAct: (act: Act | null) => void;
  handleSaveAct: () => void;
}

const ActEditForm: React.FC<ActEditFormProps> = ({ 
  editingAct, 
  setEditingAct, 
  handleSaveAct 
}) => {
  return (
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
  );
};
