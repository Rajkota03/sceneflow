
import React, { useState } from 'react';
import TitlePageView from '@/components/TitlePageView';
import { Note, ScriptContent, TitlePageData } from '@/lib/types';
import NoteWindow from '@/components/notes/NoteWindow';
import ScriptEditor from '@/components/script-editor/ScriptEditor';
import { BeatMode } from '@/types/scriptTypes';

interface EditorMainAreaProps {
  showTitlePage: boolean;
  titlePageData: TitlePageData;
  content: ScriptContent;
  onContentChange: (content: ScriptContent) => void;
  openNotes: Note[];
  splitScreenNote: Note | null;
  onNoteClose: (noteId: string) => void;
  onSplitScreen: (note: Note) => void;
  exitSplitScreen: () => void;
  onEditNote: (note: Note) => void;
  projectId?: string;
  projectTitle?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  beatMode?: BeatMode;
}

const EditorMainArea: React.FC<EditorMainAreaProps> = ({
  showTitlePage,
  titlePageData,
  content,
  onContentChange,
  openNotes,
  splitScreenNote,
  onNoteClose,
  onSplitScreen,
  exitSplitScreen,
  onEditNote,
  projectId,
  projectTitle,
  selectedStructureId,
  onStructureChange,
  beatMode = 'on'
}) => {
  const [resizing, setResizing] = useState(false);
  const [splitSize, setSplitSize] = useState(50);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing) return;
    const container = document.getElementById('split-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const percentX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (percentX > 20 && percentX < 80) {
      setSplitSize(percentX);
    }
  };

  const handleMouseUp = () => {
    setResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // If showing the title page, that's all we show
  if (showTitlePage) {
    return (
      <div className="flex-grow overflow-auto bg-white dark:bg-slate-850 py-8">
        <TitlePageView data={titlePageData} />
      </div>
    );
  }

  // If we have a split screen note, show the split view
  if (splitScreenNote) {
    return (
      <div id="split-container" className="flex-grow flex overflow-hidden relative">
        <div 
          className="h-full overflow-auto" 
          style={{ width: `${splitSize}%` }}
        >
          <ScriptEditor 
            initialContent={content} 
            onChange={onContentChange} 
            className="h-full"
            projectName={projectTitle}
            projectId={projectId}
            beatMode={beatMode}
          />
        </div>
        
        {/* Resizer handle */}
        <div 
          className="w-1 h-full bg-gray-300 dark:bg-gray-700 cursor-col-resize z-10 hover:bg-blue-400 dark:hover:bg-blue-600 active:bg-blue-400 dark:active:bg-blue-600"
          onMouseDown={handleMouseDown}
        ></div>
        
        <div 
          className="h-full overflow-auto" 
          style={{ width: `${100 - splitSize}%` }}
        >
          <NoteWindow 
            note={splitScreenNote} 
            onClose={exitSplitScreen}
            onSplitScreen={() => {}}
            onEdit={() => onEditNote(splitScreenNote)}
            className="h-full"
            isSplitScreen={true}
          />
        </div>
      </div>
    );
  }

  // Otherwise show the regular editor with floating notes
  return (
    <div className="flex-grow relative overflow-hidden">
      <ScriptEditor 
        initialContent={content} 
        onChange={onContentChange}
        projectName={projectTitle}
        projectId={projectId}
        beatMode={beatMode}
      />
      
      {/* Floating notes */}
      {openNotes.map(note => (
        <NoteWindow 
          key={note.id} 
          note={note} 
          onClose={() => onNoteClose(note.id)}
          onSplitScreen={() => onSplitScreen(note)}
          onEdit={() => onEditNote(note)}
          className="absolute top-4 right-4 w-80 h-72"
        />
      ))}
    </div>
  );
};

export default EditorMainArea;
