
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Note } from '@/lib/types';

interface NoteEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSaveNote: (note: Note) => void;
}

const NoteEditor = ({ open, onOpenChange, note, onSaveNote }: NoteEditorProps) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const isNewNote = !note?.id;

  useEffect(() => {
    // Initialize form when a note is loaded
    if (note) {
      setNoteTitle(note.title);
      setNoteContent(note.content);
    } else {
      setNoteTitle('');
      setNoteContent('');
    }
  }, [note, open]);

  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    
    const updatedNote: Note = {
      id: note?.id || `note-${Date.now()}`,
      title: noteTitle,
      content: noteContent,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    console.log(isNewNote ? 'Creating new note:' : 'Updating note:', updatedNote);
    onSaveNote(updatedNote);
    onOpenChange(false);
    
    toast({
      title: isNewNote ? "Note created" : "Note updated",
      description: `"${noteTitle}" has been ${isNewNote ? 'created' : 'updated'} successfully.`
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNewNote ? 'Create New Note' : 'Edit Note'}</DialogTitle>
          <DialogDescription>
            {isNewNote ? 'Add a note for your screenplay' : 'Edit your note'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Enter note title"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">Content</label>
            <Textarea
              id="content"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter note content"
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveNote}>
            {isNewNote ? 'Create Note' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditor;
