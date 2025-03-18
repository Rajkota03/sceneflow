
// Import the menu components and other necessary parts
import React from 'react';
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import FileMenu from '@/components/menus/FileMenu';
import EditMenu from '@/components/menus/EditMenu';
import FormatMenu from '@/components/menus/FormatMenu';
import ToolsMenu from '@/components/menus/ToolsMenu';
import ViewMenu from '@/components/menus/ViewMenu';
import ProductionMenu from '@/components/menus/ProductionMenu';
import HelpMenu from '@/components/menus/HelpMenu';
import InsertMenu from '@/components/menus/InsertMenu';
import NotesMenu from '@/components/menus/NotesMenu';
import { TitlePageData } from '@/lib/types'; // Update import to use the type from lib/types
import { Note } from '@/lib/types';

interface EditorMenuBarProps {
  onSave: () => void;
  onSaveAs: (newTitle: string) => void;
  onTitlePage: () => void;
  onToggleTitlePage: () => void;
  onEditTitlePage: (data: TitlePageData) => void;
  titlePageData: TitlePageData;
  showTitlePage: boolean;
  notes: Note[];
  onCreateNote: () => void;
  onOpenNote: (note: Note) => void;
  onEditNote?: (note: Note) => void;
}

const EditorMenuBar = ({
  onSave,
  onSaveAs,
  onTitlePage,
  onEditTitlePage,
  titlePageData,
  showTitlePage,
  onToggleTitlePage,
  notes,
  onCreateNote,
  onOpenNote,
  onEditNote
}: EditorMenuBarProps) => {
  // Ensure notes is always an array
  const safeNotes = Array.isArray(notes) ? notes : [];
  
  console.log('EditorMenuBar - notes received:', safeNotes?.length || 0);

  return (
    <Menubar className="rounded-none border-b px-2 lg:px-3 bg-[#272727] border-[#444444]">
      <FileMenu onSave={onSave} onSaveAs={onSaveAs} onTitlePage={onTitlePage} />
      <EditMenu />
      <ViewMenu showTitlePage={showTitlePage} onToggleTitlePage={onToggleTitlePage} />
      <FormatMenu />
      <InsertMenu />
      <ProductionMenu />
      <ToolsMenu />
      <NotesMenu
        notes={safeNotes}
        onCreateNote={onCreateNote}
        onOpenNote={onOpenNote}
        onEditNote={onEditNote}
      />
      <HelpMenu />
    </Menubar>
  );
};

export default EditorMenuBar;
