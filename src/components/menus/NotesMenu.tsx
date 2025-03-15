
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator
} from '@/components/ui/menubar';
import { NotebookPen, Plus, FileText, Clock } from 'lucide-react';
import { Note } from '@/lib/types';

interface NotesMenuProps {
  notes: Note[];
  onCreateNote: () => void;
  onOpenNote: (note: Note) => void;
}

const NotesMenu = ({ notes, onCreateNote, onOpenNote }: NotesMenuProps) => {
  // Get the most recent 3 notes for the "Recent Notes" section
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  console.log('NotesMenu notes:', notes);
  console.log('Sorted recent notes:', recentNotes);

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Notes</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={onCreateNote} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Create New Note
        </MenubarItem>
        
        <MenubarSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">Open Notes</div>
        {notes && notes.length > 0 ? (
          notes.map(note => (
            <MenubarItem key={note.id} onClick={() => onOpenNote(note)} className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              {note.title}
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
            <MenubarItem key={`recent-${note.id}`} onClick={() => onOpenNote(note)} className="cursor-pointer">
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
