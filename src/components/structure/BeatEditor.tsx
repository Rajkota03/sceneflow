
import React from 'react';
import { Act, Beat } from '@/lib/models/structureModel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface BeatEditorProps {
  editingBeat: { act: Act, beat: Beat };
  setEditingBeat: (beatData: { act: Act, beat: Beat } | null) => void;
  handleSaveBeat: () => void;
}

export const BeatEditor: React.FC<BeatEditorProps> = ({
  editingBeat,
  setEditingBeat,
  handleSaveBeat
}) => {
  return (
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
  );
};
