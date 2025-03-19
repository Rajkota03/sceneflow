
import React, { useState } from 'react';
import { Note } from '@/lib/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NotesGrid from '@/components/dashboard/NotesGrid';
import LoadingState from '@/components/dashboard/LoadingState';
import EmptyState from '@/components/dashboard/EmptyState';
import NoteEditor from '@/components/notes/NoteEditor';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  
  const handleOpenEditor = (note: Note | null) => {
    setActiveNote(note);
    setIsNoteEditorOpen(true);
  };
  
  const handleCloseEditor = () => {
    setActiveNote(null);
    setIsNoteEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNewProject={() => handleOpenEditor(null)}
        projectType="note"
        customCreateButton={
          <Button onClick={() => handleOpenEditor(null)}>Create New Note</Button>
        }
      />
      
      {isNoteEditorOpen ? (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="max-w-4xl mx-auto">
            <NoteEditor 
              note={activeNote || currentNote}
              onSaveNote={handleSaveNote}
              onCancel={handleCloseEditor}
            />
          </div>
        </ScrollArea>
      ) : isLoading ? (
        <LoadingState />
      ) : notes.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <NotesGrid 
            notes={notes} 
            onDeleteNote={handleDeleteNote} 
            onViewNote={(note) => handleOpenEditor(note)}
            onEditNote={(note) => handleOpenEditor(note)}
          />
        </ScrollArea>
      ) : (
        <EmptyState 
          searchQuery={searchQuery}
          clearSearch={() => setSearchQuery('')}
          createNewProject={() => handleOpenEditor(null)}
          emptyMessage="No notes yet"
          createMessage="Create your first note"
        />
      )}
    </div>
  );
};

export default NotesTab;
