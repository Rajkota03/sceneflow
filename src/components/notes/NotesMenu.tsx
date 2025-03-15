
import { useState } from 'react';
import { NotebookPen, Plus, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Note } from '@/lib/types';

interface NotesMenuProps {
  notes: Note[];
  onOpenNote: (note: Note) => void;
  onCreateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

const NotesMenu = ({ notes, onOpenNote, onCreateNote, onDeleteNote }: NotesMenuProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  
  console.log('Notes component received notes:', notes);
  
  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onCreateNote(newNote);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Note created",
      description: `"${newNoteTitle}" has been created successfully.`
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-[#333333] hover:bg-[#DDDDDD]">
            <NotebookPen size={16} className="mr-1" />
            <span>Notes</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {notes && notes.length > 0 ? (
            <>
              <div className="py-2 px-2 text-xs font-medium text-muted-foreground">
                Open Notes
              </div>
              {notes.map(note => (
                <DropdownMenuItem 
                  key={note.id} 
                  onClick={() => onOpenNote(note)}
                  className="cursor-pointer"
                >
                  <NotebookPen size={14} className="mr-2 text-muted-foreground" />
                  <span className="truncate">{note.title}</span>
                </DropdownMenuItem>
              ))}
              <div className="h-px bg-muted my-1" />
            </>
          ) : (
            <div className="py-2 px-2 text-xs text-center text-muted-foreground">
              No notes yet
            </div>
          )}
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={14} className="mr-2" />
            Create New Note
          </DropdownMenuItem>
          {notes && notes.length > 0 && (
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 size={14} className="mr-2" />
              Delete Note
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Note Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Enter note title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter note content"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {notes && notes.length > 0 ? (
                notes.map(note => (
                  <div key={note.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <NotebookPen size={14} className="mr-2 text-muted-foreground" />
                      <span>{note.title}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        onDeleteNote(note.id);
                        if (notes.length === 1) {
                          setIsDeleteDialogOpen(false);
                        }
                        toast({
                          title: "Note deleted",
                          description: `"${note.title}" has been deleted.`
                        });
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No notes to delete</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesMenu;
