
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
import ScriptEditorProvider, { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';
import SceneEditor from '@/components/script-editor/SceneEditor';
import { toast } from '@/components/ui/use-toast';
import { exportToPdf as exportScriptToPdf } from '@/lib/pdfExporter';
import KeyboardShortcutsHelp from '@/components/script-editor/KeyboardShortcutsHelp';
import { generateUniqueId } from '@/lib/formatScript'; // Import generateUniqueId
import { ElementType, Note, Structure, TitlePageData, ScriptContent } from '@/lib/types'; // Import ElementType and other needed types

// Define props for EditorContent
interface EditorContentProps {
  projectId?: string;
  project: any; // Replace 'any' with a proper project type if available
  title: string;
  isSaving: boolean;
  lastSaved: Date | string | null;
  saveButtonText: string;
  saveButtonIcon: "save" | "saved";
  showTitlePage: boolean;
  titlePageData: TitlePageData;
  notes: Note[];
  openNotes: Note[];
  splitScreenNote: Note | null;
  noteEditorOpen: boolean;
  currentEditNote: Note | null;
  structures: Structure[];
  selectedStructureId: string | null;
  setNoteEditorOpen: (isOpen: boolean) => void;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  handleSaveAs: () => void;
  handleTitlePageUpdate: (data: TitlePageData) => void;
  toggleTitlePage: () => void;
  handleCreateNoteClick: () => void;
  handleOpenNote: (note: Note) => void;
  handleCloseNote: (noteId: string) => void;
  handleDeleteNote: (noteId: string) => void;
  handleSplitScreen: (note: Note) => void;
  exitSplitScreen: () => void;
  handleEditNote: (note: Note) => void;
  handleSaveNote: (note: Note) => void;
  handleStructureChange: (structureId: string) => void;
}

// Inner component to access ScriptEditorContext for elements and render UI
const EditorContent: React.FC<EditorContentProps> = (props) => {
  const { projectId, project, title, selectedStructureId, handleStructureChange, /* ... other props ... */ } = props;
  const navigate = useNavigate();
  const editorContentRef = useRef<HTMLDivElement>(null);

  // Access elements from the context
  const { elements: scriptElements } = useScriptEditor();

  const [beatMode, setBeatMode] = useState<BeatMode>('on');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const handleToggleBeatMode = (mode: BeatMode) => setBeatMode(mode);

  // --- PDF Export Handler ---
  const handleExportPdf = useCallback(() => {
    if (!scriptElements || scriptElements.length === 0) {
      toast({ title: "Export Error", description: "No script content to export.", variant: "destructive" });
      return;
    }
    try {
      toast({ title: "Exporting PDF", description: "Please wait..." });
      exportScriptToPdf(scriptElements, `${title || 'screenplay'}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast({ title: "Export Failed", description: "Could not export script to PDF.", variant: "destructive" });
    }
  }, [scriptElements, title]);

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
            props.handleSave();
            break;
          case 'e':
            e.preventDefault();
            handleExportPdf();
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
  }, [props.handleSave, handleExportPdf]);

  const lastSavedString = props.lastSaved ? (typeof props.lastSaved === 'string' ? props.lastSaved : props.lastSaved.toLocaleString()) : null;

  const availableStructures = props.structures ? props.structures.map((s: any) => ({ id: s.id, name: s.name })) : [];

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden transition-colors duration-200 relative">
      {showKeyboardShortcuts && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-md w-full">
          <KeyboardShortcutsHelp />
          <Button variant="outline" size="sm" onClick={() => setShowKeyboardShortcuts(false)} className="mt-4 w-full">Close</Button>
        </div>
      )}

      <EditorMenuBar
        onSave={props.handleSave}
        onSaveAs={props.handleSaveAs}
        onTitlePage={props.toggleTitlePage}
        onEditTitlePage={props.handleTitlePageUpdate}
        titlePageData={props.titlePageData}
        showTitlePage={props.showTitlePage}
        onToggleTitlePage={props.toggleTitlePage}
        notes={props.notes}
        onCreateNote={props.handleCreateNoteClick}
        onOpenNote={props.handleOpenNote}
        onEditNote={props.handleEditNote}
        onToggleHelp={() => setShowKeyboardShortcuts(p => !p)}
      />

      <EditorHeader
        title={props.title}
        onTitleChange={props.handleTitleChange}
        isSaving={props.isSaving}
        saveButtonText={props.saveButtonText}
        saveButtonIcon={props.saveButtonIcon}
        onSave={props.handleSave}
        onExportPdf={handleExportPdf}
        notes={props.notes}
        onOpenNote={props.handleOpenNote}
        onCreateNote={props.handleCreateNoteClick}
        onDeleteNote={props.handleDeleteNote}
        onEditNote={props.handleEditNote}
        availableStructures={availableStructures}
        selectedStructureId={selectedStructureId}
        onStructureChange={handleStructureChange}
        beatMode={beatMode}
        onToggleBeatMode={handleToggleBeatMode}
      />

      <div className="flex-1 relative">
        <SceneEditor projectId={projectId || 'temp-project'} />
      </div>

      <EditorFooter
        showTitlePage={props.showTitlePage}
        lastSaved={lastSavedString}
        elementCount={scriptElements.length}
        characterCount={new Set(scriptElements.filter(e => e.type === 'character').map(e => e.text.replace(/\s*\(CONT'D\)\s*$/i, '').trim())).size}
      />

      {props.currentEditNote && (
        <NoteEditor
          note={props.currentEditNote}
          onSaveNote={props.handleSaveNote}
          isPopup={true}
          onClose={() => props.setNoteEditorOpen(false)}
        />
      )}
    </div>
  );
};

// Main Editor component wraps the content with providers
const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useAuth();

  // Fetch initial state using useEditorState
  const editorState = useEditorState({ projectId, session });
  const { content: fetchedContent, isLoading, project } = editorState;

  // Define a default empty script structure for new/empty projects
  const defaultInitialContent: ScriptContent = {
    elements: [{
      id: generateUniqueId(),
      type: 'action' as ElementType,
      text: ''
    }]
  };

  // Use fetched content if valid and has elements, otherwise use default
  // Ensure fetchedContent and fetchedContent.elements are checked
  const initialContentForProvider = 
    fetchedContent && fetchedContent.elements && fetchedContent.elements.length > 0
      ? fetchedContent
      : defaultInitialContent;

  // Render loading state or error state before providers
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
    // Handle project not found state
    // This might happen for a truly new project ID before first save, 
    // but useEditorState should ideally handle creating a temporary project state.
    // If useEditorState returns !project AND !isLoading, it's likely an error or invalid ID.
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="text-center">
                <p className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-4">Project not found or access denied.</p>
                {/* Optional: Add button to go back or create new */}
            </div>
        </div>
    );
  }

  return (
    <ThemeProvider>
      <FormatProvider>
        {/* Pass the guaranteed valid initialContent and necessary handlers */}
        <ScriptEditorProvider
          initialContent={initialContentForProvider}
          onChange={editorState.handleContentChange}
          projectId={projectId}
          projectTitle={editorState.title}
        >
          {/* Pass all state and handlers from useEditorState to EditorContent */}
          <EditorContent 
            {...editorState} 
            projectId={projectId} 
            handleSaveAs={() => editorState.handleSaveAs("Untitled Screenplay")} 
          />
        </ScriptEditorProvider>
      </FormatProvider>
    </ThemeProvider>
  );
};

export default Editor;

