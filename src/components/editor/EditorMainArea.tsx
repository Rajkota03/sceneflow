
import React from 'react';
import { ScriptContent, TitlePageData, Note } from '@/lib/types';
import TitlePageView from '../TitlePageView';
import NoteWindow from '../notes/NoteWindow';
import ScriptEditor from '../script-editor/ScriptEditor';
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
}

const EditorMainArea: React.FC<EditorMainAreaProps> = ({
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
}) => {
  return (
    <div className="flex-grow flex overflow-hidden">
      {/* Main editor area */}
      <div className={`flex-grow ${splitScreenNote ? 'w-1/2' : 'w-full'} overflow-hidden`}>
        {showTitlePage ? (
          <div className="h-full overflow-auto bg-white dark:bg-slate-800 p-6">
            <TitlePageView data={titlePageData} />
          </div>
        ) : (
          <ScriptEditor
            initialContent={content}
            onChange={onContentChange}
            className="h-full"
            projectName={projectTitle}
            projectId={projectId}
            selectedStructureId={selectedStructureId}
            onStructureChange={onStructureChange}
            beatMode={beatMode}
          />
        )}
      </div>

      {/* Split screen for note */}
      {splitScreenNote && (
        <div className="w-1/2 border-l border-slate-200 dark:border-slate-700">
          <NoteWindow
            note={splitScreenNote}
            onClose={() => exitSplitScreen()}
            onEdit={() => onEditNote(splitScreenNote)}
            isFullHeight={true}
            hideSplitButton={true}
            isFloating={false}
          />
        </div>
      )}

      {/* Floating note windows */}
      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2 z-50">
        {openNotes.map(note => (
          <NoteWindow
            key={note.id}
            note={note}
            onClose={() => onNoteClose(note.id)}
            onSplitScreen={() => onSplitScreen(note)}
            onEdit={() => onEditNote(note)}
          />
        ))}
      </div>
    </div>
  );
};

export default EditorMainArea;
