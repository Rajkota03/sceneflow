
import React from 'react';
import { Note } from '@/lib/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NotesGrid from '@/components/dashboard/NotesGrid';
import LoadingState from '@/components/dashboard/LoadingState';
import EmptyState from '@/components/dashboard/EmptyState';
import NoteEditor from '@/components/notes/NoteEditor';
import { Button } from '@/components/ui/button';

interface NotesTabProps {
  notes: Note[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  handleCreateNote: () => void;
  handleDeleteNote: (id: string) => void;
  handleViewNote: (note: Note) => void;
  handleEditNote: (note: Note) => void;
  isNoteEditorOpen: boolean;
  setIsNoteEditorOpen: (isOpen: boolean) => void;
  currentNote: Note | null;
  handleSaveNote: (note: Note) => void;
}

const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  searchQuery,
  setSearchQuery,
  isLoading,
  handleCreateNote,
  handleDeleteNote,
  handleViewNote,
  handleEditNote,
  isNoteEditorOpen,
  setIsNoteEditorOpen,
  currentNote,
  handleSaveNote
}) => {
  return (
    <>
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNewProject={handleCreateNote}
        projectType="note"
        customCreateButton={
          <Button onClick={handleCreateNote}>Create New Note</Button>
        }
      />
      
      {isLoading ? (
        <LoadingState />
      ) : notes.length > 0 ? (
        <NotesGrid 
          notes={notes} 
          onDeleteNote={handleDeleteNote} 
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
        />
      ) : (
        <EmptyState 
          searchQuery={searchQuery}
          clearSearch={() => setSearchQuery('')}
          createNewProject={handleCreateNote}
          emptyMessage="No notes yet"
          createMessage="Create your first note"
        />
      )}
      
      <NoteEditor 
        open={isNoteEditorOpen}
        onOpenChange={setIsNoteEditorOpen}
        note={currentNote}
        onSaveNote={handleSaveNote}
      />
    </>
  );
};

export default NotesTab;
