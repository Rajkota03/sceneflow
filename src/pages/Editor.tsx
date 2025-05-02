
import React, { useRef, useState, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
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
import { toast } from '@/components/ui/use-toast'; // Import toast
import html2canvas from 'html2canvas'; // Import html2canvas
import { jsPDF } from 'jspdf'; // Import jsPDF
import KeyboardShortcutsHelp from '@/components/script-editor/KeyboardShortcutsHelp'; // Import help component

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useAuth();
  const navigate = useNavigate(); // Hook for navigation
  const editorContentRef = useRef<HTMLDivElement>(null); // Ref for the main editor area for export

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

  const [beatMode, setBeatMode] = useState<BeatMode>('on');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false); // State for help visibility

  const handleToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
  };

  // --- Global Keyboard Shortcuts --- 
  const exportToPdf = useCallback(async () => {
    const elementToExport = editorContentRef.current?.querySelector('.script-page-content'); // Target the content
    if (!elementToExport) {
        toast({ title: "Export Error", description: "Could not find script content to export.", variant: "destructive" });
        return;
    }

    try {
      toast({ title: "Exporting PDF", description: "Please wait..." });
      // Ensure styles are applied for export if needed (e.g., specific font loading)
      const canvas = await html2canvas(elementToExport as HTMLElement, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: [8.5, 11] });
      const imgWidth = 8.5; // Use full width for calculation
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 11; // Standard page height
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page (margins are handled by the CSS/layout of elementToExport)
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Negative position
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add page numbers (optional, needs refinement for accuracy)
      // const pageCount = pdf.getNumberOfPages();
      // for (let i = 1; i <= pageCount; i++) {
      //   pdf.setPage(i);
      //   pdf.setFontSize(10);
      //   pdf.setFont('Courier');
      //   pdf.text(String(i), pdf.internal.pageSize.getWidth() - 1, 0.5); // Top right
      // }

      pdf.save(`${title || 'screenplay'}.pdf`);
      toast({ title: "PDF Exported", description: "Your script has been exported successfully." });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({ title: "Export Failed", description: "Could not export script to PDF.", variant: "destructive" });
    }
  }, [title, editorContentRef]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when input fields or textareas are focused
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
         // Allow specific shortcuts like Ctrl+S even in editor
         if (!((e.ctrlKey || e.metaKey) && e.key === 's')) {
            return;
         }
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's': // Save
            e.preventDefault();
            console.log("Ctrl+S pressed, saving...");
            handleSave();
            break;
          case 'e': // Export PDF
            e.preventDefault();
            console.log("Ctrl+E pressed, exporting PDF...");
            exportToPdf();
            break;
          case '/': // Toggle Help
            e.preventDefault();
            console.log("Ctrl+/ pressed, toggling help...");
            setShowKeyboardShortcuts(prev => !prev);
            break;
          // Add Undo/Redo placeholders if state management allows
          // case 'z': // Undo
          //   e.preventDefault();
          //   // undo();
          //   break;
          // case 'y': // Redo (Windows/Linux)
          // case 'Z': // Redo (Mac - Shift+Cmd+Z)
          //   if (e.key === 'y' || (e.key === 'Z' && e.shiftKey)) {
          //      e.preventDefault();
          //      // redo();
          //   }
          //   break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  // Add dependencies: handleSave, exportToPdf
  }, [handleSave, exportToPdf]);

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
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button> // Use navigate
        </div>
      </div>
    );
  }

  const availableStructures = structures ? structures.map(s => ({ id: s.id, name: s.name })) : [];

  return (
    <ThemeProvider>
      <FormatProvider>
        {/* Pass down shortcut visibility state if needed by provider */}
        <ScriptEditorProvider
          initialContent={content}
          onChange={handleContentChange}
          projectId={projectId}
          selectedStructureId={selectedStructureId}
          onStructureChange={handleStructureChange}
          projectTitle={title}
          // showKeyboardShortcuts={showKeyboardShortcuts} // Pass down if needed
          // toggleKeyboardShortcuts={() => setShowKeyboardShortcuts(p => !p)} // Pass down if needed
        >
          <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden transition-colors duration-200 relative"> {/* Added relative positioning */}
            {/* Conditionally render Keyboard Shortcuts Help */} 
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
              // Add help toggle to menu?
              onToggleHelp={() => setShowKeyboardShortcuts(p => !p)}
            />
            
            <EditorHeader
              title={title}
              onTitleChange={handleTitleChange}
              isSaving={isSaving}
              saveButtonText={saveButtonText}
              saveButtonIcon={saveButtonIcon}
              onSave={handleSave}
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
            
            {/* Pass ref to EditorMainArea */}
            <EditorMainArea
              ref={editorContentRef} // Pass the ref here
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
              // More accurate character count needed (unique names)
              characterCount={new Set(content.elements.filter(e => e.type === 'character').map(e => e.text.replace(/\s*\(CONT'D\)\s*$/i, '').trim())).size}
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
        </ScriptEditorProvider>
      </FormatProvider>
    </ThemeProvider>
  );
};

export default Editor;

