
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
  // Use local state for better input handling
  const [title, setTitle] = React.useState(editingBeat.beat.title);
  const [description, setDescription] = React.useState(editingBeat.beat.description);

  // Update local state when editingBeat changes
  React.useEffect(() => {
    setTitle(editingBeat.beat.title);
    setDescription(editingBeat.beat.description);
  }, [editingBeat.beat.id]);

  // Update parent state when inputs change
  React.useEffect(() => {
    setEditingBeat({
      ...editingBeat,
      beat: { 
        ...editingBeat.beat, 
        title, 
        description 
      }
    });
  }, [title, description]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="beat-title" className="block text-sm font-medium text-slate-700 mb-1">
          Beat Title
        </label>
        <Input 
          id="beat-title"
          value={title} 
          onChange={handleTitleChange}
          className="border-slate-200"
          placeholder="Enter beat title..."
        />
      </div>
      <div>
        <label htmlFor="beat-description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <Textarea 
          id="beat-description"
          value={description} 
          onChange={handleDescriptionChange}
          className="border-slate-200 min-h-[120px]"
          placeholder="Enter beat description... (Press Enter for new lines)"
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
