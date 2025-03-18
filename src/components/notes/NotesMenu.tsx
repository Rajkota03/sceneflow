
import { useState } from 'react';
import { NotebookPen, Plus, Trash2, Edit, BookText } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Note } from '@/lib/types';
import StructureSelector from '../act-bar/StructureSelector';

interface NotesMenuProps {
  notes: Note[];
  onOpenNote: (note: Note) => void;
  onCreateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote?: (note: Note) => void;
  availableStructures?: Array<{ id: string; name: string }>;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
}

const NotesMenu = ({ 
  notes, 
  onOpenNote, 
  onCreateNote, 
  onDeleteNote, 
  onEditNote,
  availableStructures = [],
  selectedStructureId,
  onStructureChange
}: NotesMenuProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  
  // Ensure notes is an array
  const safeNotes = Array.isArray(notes) ? notes : [];
  
  console.log('Notes component received notes:', safeNotes?.length || 0);
  
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
      id: '', // This will be replaced with a unique ID in the handleCreateNote function
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onCreateNote(newNote);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsCreateDialogOpen(false);
  };

  const handleNoteClick = (note: Note) => {
    console.log('Opening note:', note.title);
    onOpenNote(note);
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
          {availableStructures && availableStructures.length > 0 && onStructureChange && (
            <>
              <div className="py-2 px-2 text-xs font-medium text-muted-foreground">
                Story Structure
              </div>
              <div className="px-2 pb-2">
                <StructureSelector
                  availableStructures={availableStructures}
                  selectedStructureId={selectedStructureId}
                  onStructureChange={onStructureChange}
                />
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          
          <div className="py-2 px-2 text-xs font-medium text-muted-foreground">
            Notes
          </div>
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)} className="cursor-pointer">
            <Plus size={14} className="mr-2" />
            Create New Note
          </DropdownMenuItem>
          
          {safeNotes && safeNotes.length > 0 ? (
            <>
              <DropdownMenuSeparator />
              <div className="py-2 px-2 text-xs font-medium text-muted-foreground">
                Open Notes
              </div>
              {safeNotes.map(note => (
                <DropdownMenuItem 
                  key={note.id} 
                  onClick={() => handleNoteClick(note)}
                  className="cursor-pointer flex justify-between"
                >
                  <div className="flex items-center">
                    <NotebookPen size={14} className="mr-2 text-muted-foreground" />
                    <span className="truncate">{note.title}</span>
                  </div>
                  {onEditNote && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-2" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditNote(note);
                      }}
                    >
                      <Edit size={12} />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="cursor-pointer">
                <Trash2 size={14} className="mr-2" />
                Delete Note
              </DropdownMenuItem>
            </>
          ) : (
            <div className="py-2 px-2 text-xs text-center text-muted-foreground">
              No notes yet
            </div>
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
              {safeNotes && safeNotes.length > 0 ? (
                safeNotes.map(note => (
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
                        if (safeNotes.length === 1) {
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
