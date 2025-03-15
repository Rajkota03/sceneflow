
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator
} from '@/components/ui/menubar';
import { NotebookPen, Plus, FileText } from 'lucide-react';
import { Note } from '@/lib/types';

interface NotesMenuProps {
  notes: Note[];
  onCreateNote: () => void;
  onOpenNote: (note: Note) => void;
}

const NotesMenu = ({ notes, onCreateNote, onOpenNote }: NotesMenuProps) => {
  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Notes</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={onCreateNote}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Note
        </MenubarItem>
        
        {notes.length > 0 && (
          <>
            <MenubarSeparator />
            <div className="px-2 py-1 text-xs text-muted-foreground">Open Notes</div>
            {notes.map(note => (
              <MenubarItem key={note.id} onClick={() => onOpenNote(note)}>
                <FileText className="mr-2 h-4 w-4" />
                {note.title}
              </MenubarItem>
            ))}
          </>
        )}
      </MenubarContent>
    </MenubarMenu>
  );
};

export default NotesMenu;
