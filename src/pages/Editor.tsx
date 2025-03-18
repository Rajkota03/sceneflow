
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import EditorMenuBar from '../components/EditorMenuBar';
import { FormatProvider } from '@/lib/formatContext';
import { useAuth } from '@/App';
import NoteEditor from '@/components/notes/NoteEditor';
import { useEditorState } from '@/components/editor/useEditorState';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorFooter from '@/components/editor/EditorFooter';
import EditorMainArea from '@/components/editor/EditorMainArea';

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useAuth();
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
          <p className="text-slate-600">Loading your screenplay...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-xl font-medium text-slate-900 mb-4">Project not found</p>
          <Button onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <FormatProvider>
      <div className="h-screen flex flex-col bg-slate-100 overflow-hidden" ref={mainContainerRef}>
        <EditorMenuBar 
          onSave={() => handleSave()} 
          onSaveAs={handleSaveAs} 
          onTitlePage={() => toggleTitlePage()}
          onEditTitlePage={(data) => handleTitlePageUpdate(data)}
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
        />
        
        <EditorFooter
          showTitlePage={showTitlePage}
          lastSaved={lastSaved}
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
    </FormatProvider>
  );
};

export default Editor;
