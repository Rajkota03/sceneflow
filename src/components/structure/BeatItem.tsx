
import React, { useState } from 'react';
import { Act, Beat } from '@/lib/models/structureModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, GripVertical } from 'lucide-react';

interface BeatItemProps {
  act: Act;
  beat: Beat;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave?: (updatedBeat: Beat) => void;
}

export const BeatItem: React.FC<BeatItemProps> = ({
  act,
  beat,
  isEditing,
  onEdit,
  onDelete,
  onSave
}) => {
  const [editedBeat, setEditedBeat] = useState<Beat>({ ...beat });
  
  const handleSave = () => {
    if (onSave) {
      onSave(editedBeat);
    }
  };
  
  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors group">
        <div className="space-y-4">
          <div>
            <label htmlFor="beat-title" className="block text-sm font-medium text-slate-700 mb-1">
              Beat Title
            </label>
            <Input 
              id="beat-title"
              value={editedBeat.title} 
              onChange={(e) => setEditedBeat({
                ...editedBeat,
                title: e.target.value
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
              value={editedBeat.description} 
              onChange={(e) => setEditedBeat({
                ...editedBeat,
                description: e.target.value
              })} 
              rows={3}
              className="border-slate-200 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors group">
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
              onEdit();
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
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};
