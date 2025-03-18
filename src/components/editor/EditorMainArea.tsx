
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import ScriptEditor from '../script-editor/ScriptEditor';
import TitlePageView from '@/components/TitlePageView';
import NoteWindow from '@/components/notes/NoteWindow';
import { Note, ScriptContent, TitlePageData } from '@/lib/types';

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
  selectedStructureId
}) => {
  return (
    <main className="flex-grow overflow-hidden py-4 px-4 bg-[#EEEEEE] relative">
      {splitScreenNote ? (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full overflow-auto">
              {showTitlePage ? (
                <TitlePageView data={titlePageData} />
              ) : (
                <ScriptEditor 
                  initialContent={content} 
                  onChange={onContentChange} 
                  className="overflow-auto"
                  projectName={projectTitle}
                  structureName="Three Act Structure"
                  projectId={projectId}
                  onStructureChange={onStructureChange}
                  selectedStructureId={selectedStructureId || undefined}
                />
              )}
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 px-3 py-2 flex justify-between items-center border-b">
                <h3 className="text-sm font-medium">Notes</h3>
                <div className="flex space-x-2">
                  {splitScreenNote && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditNote(splitScreenNote)}
                      className="text-xs h-7"
                    >
                      <Pencil size={14} className="mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={exitSplitScreen}
                    className="text-xs h-7"
                  >
                    Exit Split View
                  </Button>
                </div>
              </div>
              <div className="flex-grow overflow-auto p-3">
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
        <>
          {showTitlePage ? (
            <TitlePageView data={titlePageData} />
          ) : (
            <ScriptEditor 
              initialContent={content} 
              onChange={onContentChange}
              projectName={projectTitle}
              structureName="Three Act Structure" 
              projectId={projectId}
              onStructureChange={onStructureChange}
              selectedStructureId={selectedStructureId || undefined}
            />
          )}
        </>
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
