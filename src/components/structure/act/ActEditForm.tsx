
import React from 'react';
import { Act } from '@/lib/models/structureModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ActEditFormProps {
  editingAct: Act;
  setEditingAct: (act: Act | null) => void;
  handleSaveAct: () => void;
}

export const ActEditForm: React.FC<ActEditFormProps> = ({ 
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
