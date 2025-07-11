
import React, { useState } from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator
} from '@/components/ui/menubar';
import { NotebookPen, Plus, FileText, Clock, Edit } from 'lucide-react';
import { Note } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import NotePopover from '@/components/notes/NotePopover';

interface NotesMenuProps {
  notes: Note[];
  onCreateNote: (note: Note) => void;
  onOpenNote: (note: Note) => void;
  onEditNote?: (note: Note) => void;
}

const NotesMenu = ({ notes, onCreateNote, onOpenNote, onEditNote }: NotesMenuProps) => {
  // Ensure notes is an array before proceeding
  const safeNotes = Array.isArray(notes) ? notes : [];
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get the most recent 3 notes for the "Recent Notes" section
  const recentNotes = safeNotes && safeNotes.length > 0 
    ? [...safeNotes].sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
        const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 3)
    : [];

  console.log('NotesMenu component - notes available:', safeNotes?.length || 0);
  console.log('NotesMenu component - recent notes:', recentNotes?.length || 0);

  const handleOpenNote = (note: Note) => {
    console.log('Opening note from menu:', note.title);
    onOpenNote(note);
    toast({
      title: "Note opened",
      description: `"${note.title}" has been opened.`
    });
  };

  const handleCreateNote = (noteData: Partial<Note>) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onCreateNote(newNote);
  };

  const handleEditNote = (note: Note, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setSelectedNote(note);
    setIsEditing(true);
    
    if (onEditNote) {
      onEditNote(note);
    }
  };

  const handleUpdateNote = (noteData: Partial<Note>) => {
    if (selectedNote && onEditNote) {
      const updatedNote: Note = {
        ...selectedNote,
        title: noteData.title || selectedNote.title,
        content: noteData.content || selectedNote.content,
        updatedAt: new Date()
      };
      
      onEditNote(updatedNote);
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Notes</MenubarTrigger>
      <MenubarContent>
        <div className="pb-2">
          <NotePopover 
            onSave={handleCreateNote}
            triggerClassName="w-full justify-start"
            buttonText="Create New Note"
          />
        </div>
        
        <MenubarSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">Open Notes</div>
        {safeNotes && safeNotes.length > 0 ? (
          safeNotes.map(note => (
            <MenubarItem 
              key={note.id} 
              className="cursor-pointer flex justify-between items-center group"
              onClick={() => handleOpenNote(note)}
            >
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {note.title}
              </div>
              {onEditNote && (
                <button 
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded"
                  onClick={(e) => handleEditNote(note, e)}
                >
                  <Edit className="h-3 w-3" />
                </button>
              )}
            </MenubarItem>
          ))
        ) : (
          <MenubarItem disabled>
            <span className="text-muted-foreground italic">No notes available</span>
          </MenubarItem>
        )}
        
        <MenubarSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">Recent Notes</div>
        {recentNotes && recentNotes.length > 0 ? (
          recentNotes.map(note => (
            <MenubarItem 
              key={`recent-${note.id}`} 
              onClick={() => handleOpenNote(note)} 
              className="cursor-pointer"
            >
              <Clock className="mr-2 h-4 w-4" />
              {note.title}
            </MenubarItem>
          ))
        ) : (
          <MenubarItem disabled>
            <span className="text-muted-foreground italic">No recent notes</span>
          </MenubarItem>
        )}
      </MenubarContent>
    </MenubarMenu>
  );
};

export default NotesMenu;
