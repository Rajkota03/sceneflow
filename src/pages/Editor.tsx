
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import ScriptEditorProvider, { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider'; // Import useScriptEditor
import { toast } from '@/components/ui/use-toast';
// Removed html2canvas and jsPDF imports as we use the dedicated exporter now
import { exportToPdf as exportScriptToPdf } from '@/lib/pdfExporter'; // Import the new exporter
import KeyboardShortcutsHelp from '@/components/script-editor/KeyboardShortcutsHelp';

// Inner component to access ScriptEditorContext for elements
const EditorContent = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();
  const editorContentRef = useRef<HTMLDivElement>(null); // Keep ref if needed for other purposes

  // Access elements from the context
  const { elements: scriptElements } = useScriptEditor(); 

  const {
    project,
    title,
    content, // Keep initial content if needed
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
    handleContentChange, // This is passed to Provider, not used directly here
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

  const [beatMode, setBeatMode] = useState<BeatMode>('on');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const handleToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
  };

  // --- PDF Export Handler ---
  const handleExportPdf = useCallback(() => {
    if (!scriptElements || scriptElements.length === 0) {
      toast({ title: "Export Error", description: "No script content to export.", variant: "destructive" });
      return;
    }
    try {
      toast({ title: "Exporting PDF", description: "Please wait..." });
      exportScriptToPdf(scriptElements, `${title || 'screenplay'}.pdf`); // Use the new exporter
      // Success toast is handled within the exporter or can be added here if preferred
      // toast({ title: "PDF Exported", description: "Your script has been exported successfully." });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({ title: "Export Failed", description: "Could not export script to PDF.", variant: "destructive" });
    }
  }, [scriptElements, title]); // Depend on elements from context and title

  // --- Global Keyboard Shortcuts --- 
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
         if (!((e.ctrlKey || e.metaKey) && e.key === 's')) {
            return;
         }
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'e':
            e.preventDefault();
            handleExportPdf(); // Use the new handler
            break;
          case '/':
            e.preventDefault();
            setShowKeyboardShortcuts(prev => !prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleSave, handleExportPdf]); // Updated dependencies

  // --- End Global Keyboard Shortcuts ---

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
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const availableStructures = structures ? structures.map(s => ({ id: s.id, name: s.name })) : [];

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden transition-colors duration-200 relative">
      {showKeyboardShortcuts && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-md w-full">
              <KeyboardShortcutsHelp />
              <Button variant="outline" size="sm" onClick={() => setShowKeyboardShortcuts(false)} className="mt-4 w-full">Close</Button>
          </div>
      )}

      <EditorMenuBar 
        onSave={handleSave} 
        onSaveAs={handleSaveAs} 
        onTitlePage={toggleTitlePage}
        onEditTitlePage={handleTitlePageUpdate}
        titlePageData={titlePageData}
        showTitlePage={showTitlePage}
        onToggleTitlePage={toggleTitlePage}
        notes={notes}
        onCreateNote={handleCreateNoteClick}
        onOpenNote={handleOpenNote}
        onEditNote={handleEditNote}
        onToggleHelp={() => setShowKeyboardShortcuts(p => !p)}
      />
      
      <EditorHeader
        title={title}
        onTitleChange={handleTitleChange}
        isSaving={isSaving}
        saveButtonText={saveButtonText}
        saveButtonIcon={saveButtonIcon}
        onSave={handleSave}
        onExportPdf={handleExportPdf} // Pass the handler to the header
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
        ref={editorContentRef}
        showTitlePage={showTitlePage}
        titlePageData={titlePageData}
        content={content} // Pass initial content if needed by MainArea
        onContentChange={handleContentChange} // Pass content change handler if needed
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
        elementCount={scriptElements.length} // Use elements from context
        characterCount={new Set(scriptElements.filter(e => e.type === 'character').map(e => e.text.replace(/\s*\(CONT'D\)\s*$/i, '').trim())).size}
      />
      
      {currentEditNote && (
        <NoteEditor 
          note={currentEditNote} 
          onSaveNote={handleSaveNote}
          isPopup={true}
          onClose={() => setNoteEditorOpen(false)}
        />
      )}
    </div>
  );
};

// Main Editor component wraps the content with providers
const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useAuth();

  // Fetch initial state including content using useEditorState
  const { content, isLoading, project, handleContentChange, title, selectedStructureId, handleStructureChange } = useEditorState({ projectId, session });

  // Render loading state or error state before providers if necessary
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
      // Handle project not found state here if needed, similar to EditorContent
      return <div>Project not found or access denied.</div>;
  }

  return (
    <ThemeProvider>
      <FormatProvider>
        <ScriptEditorProvider
          initialContent={content} // Pass the fetched initial content
          onChange={handleContentChange} // Pass the handler from useEditorState
          projectId={projectId}
          selectedStructureId={selectedStructureId}
          onStructureChange={handleStructureChange}
          projectTitle={title}
        >
          <EditorContent /> {/* Render the inner component that uses the context */}
        </ScriptEditorProvider>
      </FormatProvider>
    </ThemeProvider>
  );
};

export default Editor;

