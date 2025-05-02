
import React, { forwardRef } from 'react'; // Import forwardRef
import { ScriptContent, TitlePageData, Note } from '@/lib/types';
import TitlePageView from '../TitlePageView';
import NoteWindow from '../notes/NoteWindow';
import ScriptEditor from '../script-editor/ScriptEditor';
import VerticalStructurePanel from '../structure-panel/VerticalStructurePanel'; // Import the new panel
import { BeatMode } from '@/types/scriptTypes';

interface EditorMainAreaProps {
  showTitlePage: boolean;
  titlePageData: TitlePageData;
  content: ScriptContent;
  onContentChange: (content: ScriptContent) => void;
  splitScreenNote: Note | null;
  openNotes: Note[];
  onNoteClose: (noteId: string) => void;
  onSplitScreen: (note: Note) => void;
  exitSplitScreen: () => void;
  onEditNote: (note: Note) => void;
  projectId?: string;
  projectTitle?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  beatMode: BeatMode;
  // Add prop for toggling structure panel visibility if needed later
  // showStructurePanel: boolean;
}

// Use forwardRef to allow passing ref down to a DOM element if needed (e.g., for PDF export)
const EditorMainArea = forwardRef<HTMLDivElement, EditorMainAreaProps>((
  {
    showTitlePage,
    titlePageData,
    content,
    onContentChange,
    splitScreenNote,
    openNotes,
    onNoteClose,
    onSplitScreen,
    exitSplitScreen,
    onEditNote,
    projectId,
    projectTitle,
    selectedStructureId,
    onStructureChange,
    beatMode
    // showStructurePanel // Use this prop if implementing toggle
  },
  ref // Forwarded ref
) => {
  // Determine the width of the main editor area based on split screen and structure panel
  const editorWidthClass = splitScreenNote ? 'w-1/2' : 'flex-grow'; // Adjust if structure panel is also shown

  return (
    // Main flex container for the editor area and side panels
    <div className="flex-grow flex overflow-hidden" ref={ref}> {/* Attach ref here */}
      
      {/* Vertical Structure Panel (Left Side) */} 
      {/* TODO: Add toggle functionality later */} 
      <div className="w-64 flex-shrink-0 h-full overflow-y-auto hidden md:block"> {/* Fixed width, hide on small screens */}
        <VerticalStructurePanel />
      </div>

      {/* Main Content Area (Script Editor or Title Page) */}
      <div className={`flex-grow ${splitScreenNote ? 'w-1/2' : ''} overflow-hidden flex flex-col`}> {/* Adjusted width calculation needed if structure panel is always visible */}
        {showTitlePage ? (
          <div className="h-full overflow-auto bg-white dark:bg-slate-800 p-6">
            <TitlePageView data={titlePageData} />
          </div>
        ) : (
          <ScriptEditor
            initialContent={content}
            onChange={onContentChange}
            className="h-full flex-grow" // Ensure it takes available height
            projectName={projectTitle}
            projectId={projectId}
            // selectedStructureId={selectedStructureId} // Context likely handles this now
            // onStructureChange={onStructureChange} // Context likely handles this now
            beatMode={beatMode}
          />
        )}
      </div>

      {/* Split screen for note (Right Side) */}
      {splitScreenNote && (
        <div className="w-1/2 flex-shrink-0 border-l border-slate-200 dark:border-slate-700 h-full overflow-y-auto">
          <NoteWindow
            note={splitScreenNote}
            onClose={() => exitSplitScreen()} // Use exitSplitScreen callback
            onEdit={() => onEditNote(splitScreenNote)}
            isFullHeight={true}
            hideSplitButton={true}
            isFloating={false}
          />
        </div>
      )}

      {/* Floating note windows (remain fixed position) */}
      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2 z-50">
        {openNotes.map(note => (
          <NoteWindow
            key={note.id}
            note={note}
            onClose={() => onNoteClose(note.id)}
            onSplitScreen={() => onSplitScreen(note)}
            onEdit={() => onEditNote(note)}
            isFloating={true} // Ensure this is set for floating windows
          />
        ))}
      </div>
    </div>
  );
});

EditorMainArea.displayName = 'EditorMainArea'; // Add display name for DevTools

export default EditorMainArea;

