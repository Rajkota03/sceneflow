
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import TitlePageView from '@/components/TitlePageView';
import NoteWindow from '@/components/notes/NoteWindow';
import { Note, ScriptContent, TitlePageData } from '@/lib/types';
import { BeatMode } from '@/types/scriptTypes';
import ScriptEditorProvider from '@/components/script-editor/ScriptEditorProvider';
import ScriptEditorContent from '@/components/script-editor/ScriptEditorContent';

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
  projectTitle: string;
  onStructureChange: (structureId: string) => void;
  selectedStructureId: string | null;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
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
  onStructureChange,
  selectedStructureId,
  beatMode = 'on',
  onToggleBeatMode
}) => {
  return (
    <main className="flex-grow overflow-hidden py-4 px-4 bg-[#EEEEEE] dark:bg-slate-900 relative transition-colors duration-200">
      {splitScreenNote ? (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full overflow-auto w-full flex justify-center">
              {showTitlePage ? (
                <TitlePageView data={titlePageData} />
              ) : (
                <ScriptEditorProvider
                  initialContent={content}
                  onChange={onContentChange}
                  projectId={projectId}
                  selectedStructureId={selectedStructureId}
                  onStructureChange={onStructureChange}
                  beatMode={beatMode}
                  onToggleBeatMode={onToggleBeatMode}
                >
                  <ScriptEditorContent 
                    zoomPercentage={100} 
                    onZoomChange={(value) => {}} 
                  />
                </ScriptEditorProvider>
              )}
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-slate-800 px-3 py-2 flex justify-between items-center border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-medium dark:text-slate-200">Notes</h3>
                <div className="flex space-x-2">
                  {splitScreenNote && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditNote(splitScreenNote)}
                      className="text-xs h-7 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Pencil size={14} className="mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={exitSplitScreen}
                    className="text-xs h-7 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Exit Split View
                  </Button>
                </div>
              </div>
              <div className="flex-grow overflow-auto p-3 bg-white dark:bg-slate-800">
                {splitScreenNote && (
                  <NoteWindow 
                    note={splitScreenNote} 
                    onClose={() => onNoteClose(splitScreenNote.id)} 
                    onSplitScreen={() => {}} 
                    isFloating={false}
                    onEditNote={onEditNote}
                  />
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="h-full w-full flex justify-center">
          {showTitlePage ? (
            <TitlePageView data={titlePageData} />
          ) : (
            <ScriptEditorProvider
              initialContent={content}
              onChange={onContentChange}
              projectId={projectId}
              selectedStructureId={selectedStructureId}
              onStructureChange={onStructureChange}
              beatMode={beatMode}
              onToggleBeatMode={onToggleBeatMode}
            >
              <ScriptEditorContent 
                zoomPercentage={100} 
                onZoomChange={(value) => {}} 
              />
            </ScriptEditorProvider>
          )}
        </div>
      )}
      
      {openNotes.map(note => (
        <NoteWindow 
          key={note.id}
          note={note}
          onClose={() => onNoteClose(note.id)}
          onSplitScreen={onSplitScreen}
          isFloating={true}
          onEditNote={onEditNote}
        />
      ))}
    </main>
  );
};

export default EditorMainArea;
