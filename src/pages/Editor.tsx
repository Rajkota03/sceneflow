
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditorMenuBar from '../components/EditorMenuBar';
import { FormatProvider } from '@/lib/formatContext';
import { ThemeProvider } from '@/lib/themeContext';
import { useAuth } from '@/App';
import NoteEditor from '@/components/notes/NoteEditor';
import { useEditorState } from '@/components/editor/useEditorState';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorFooter from '@/components/editor/EditorFooter';
import EditorMainArea from '@/components/editor/EditorMainArea';
import { BeatMode } from '@/types/scriptTypes';
import ScriptEditorProvider from '@/components/script-editor/ScriptEditorProvider';

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useAuth();
  
  const {
    project,
    title,
    content,
    isSaving,
    lastSaved,
    isLoading,
    saveButtonText,
    saveButtonIcon,
    showTitlePage,
    titlePageData,
    notes,
    openNotes,
    splitScreenNote,
    noteEditorOpen,
    currentEditNote,
    selectedStructureId,
    structures,
    setNoteEditorOpen,
    handleContentChange,
    handleTitleChange,
    handleSave,
    handleSaveAs,
    handleTitlePageUpdate,
    toggleTitlePage,
    handleCreateNoteClick,
    handleOpenNote,
    handleCloseNote,
    handleDeleteNote,
    handleSplitScreen,
    exitSplitScreen,
    handleEditNote,
    handleSaveNote,
    handleStructureChange,
  } = useEditorState({ projectId, session });

  // State for beat mode (to be passed to both Header and MainArea)
  const [beatMode, setBeatMode] = useState<BeatMode>('on');
  
  const handleToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
  };

  // Convert the Date to string for the EditorFooter component
  const lastSavedString = lastSaved ? (typeof lastSaved === 'string' ? lastSaved : lastSaved.toLocaleString()) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading your screenplay...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-4">Project not found</p>
          <Button onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Create an array for structure selection
  const availableStructures = structures ? structures.map(s => ({ id: s.id, name: s.name })) : [];

  return (
    <ThemeProvider>
      <FormatProvider>
        <ScriptEditorProvider
          initialContent={content}
          onChange={handleContentChange}
          projectId={projectId}
          selectedStructureId={selectedStructureId}
          onStructureChange={handleStructureChange}
          projectTitle={title}
        >
          <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden transition-colors duration-200">
            <EditorMenuBar 
              onSave={() => handleSave()} 
              onSaveAs={handleSaveAs} 
              onTitlePage={() => toggleTitlePage()}
              onEditTitlePage={handleTitlePageUpdate}
              titlePageData={titlePageData}
              showTitlePage={showTitlePage}
              onToggleTitlePage={toggleTitlePage}
              notes={notes}
              onCreateNote={handleCreateNoteClick}
              onOpenNote={handleOpenNote}
              onEditNote={handleEditNote}
            />
            
            <EditorHeader
              title={title}
              onTitleChange={handleTitleChange}
              isSaving={isSaving}
              saveButtonText={saveButtonText}
              saveButtonIcon={saveButtonIcon}
              onSave={() => handleSave()}
              notes={notes}
              onOpenNote={handleOpenNote}
              onCreateNote={handleCreateNoteClick}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleEditNote}
              availableStructures={availableStructures}
              selectedStructureId={selectedStructureId}
              onStructureChange={handleStructureChange}
              beatMode={beatMode}
              onToggleBeatMode={handleToggleBeatMode}
            />
            
            <EditorMainArea
              showTitlePage={showTitlePage}
              titlePageData={titlePageData}
              content={content}
              onContentChange={handleContentChange}
              splitScreenNote={splitScreenNote}
              openNotes={openNotes}
              onNoteClose={handleCloseNote}
              onSplitScreen={handleSplitScreen}
              exitSplitScreen={exitSplitScreen}
              onEditNote={handleEditNote}
              projectId={projectId}
              projectTitle={title}
              onStructureChange={handleStructureChange}
              selectedStructureId={selectedStructureId}
              beatMode={beatMode}
            />
            
            <EditorFooter
              showTitlePage={showTitlePage}
              lastSaved={lastSavedString}
              elementCount={content.elements.length}
              characterCount={content.elements.filter(e => e.type === 'character').length}
            />
            
            <NoteEditor 
              open={noteEditorOpen} 
              onOpenChange={setNoteEditorOpen} 
              note={currentEditNote}
              onSaveNote={handleSaveNote}
            />
          </div>
        </ScriptEditorProvider>
      </FormatProvider>
    </ThemeProvider>
  );
};

export default Editor;
