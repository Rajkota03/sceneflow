
import React from 'react';
import { ScriptContent } from '../../lib/types';
import { useFormat } from '@/lib/formatContext';
import ScriptEditorProvider from './ScriptEditorProvider';
import ScriptEditorContent from './ScriptEditorContent';
import { Note } from '@/lib/types';
import { BeatMode } from '@/types/scriptTypes';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectName?: string;
  structureName?: string;
  projectId?: string;
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
}

const ScriptEditor = ({ 
  initialContent, 
  onChange, 
  className,
  projectName = "Untitled Project",
  projectId,
  onStructureChange,
  selectedStructureId,
  beatMode = 'on'
}: ScriptEditorProps) => {
  const { formatState, setZoomLevel } = useFormat();
  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  };

  // Ensure initialContent has at least one element
  if (!initialContent.elements || initialContent.elements.length === 0) {
    initialContent = {
      elements: [
        {
          id: "default-element-1",
          type: "scene-heading",
          text: "INT. SOMEWHERE - DAY"
        },
        {
          id: "default-element-2",
          type: "action",
          text: "Start writing your screenplay here..."
        }
      ]
    };
  }

  return (
    <ScriptEditorProvider
      initialContent={initialContent}
      onChange={onChange}
      projectId={projectId}
      selectedStructureId={selectedStructureId}
      onStructureChange={onStructureChange}
      projectTitle={projectName}
    >
      <ScriptEditorContent
        className={className}
        zoomPercentage={zoomPercentage} 
        onZoomChange={handleZoomChange}
      />
    </ScriptEditorProvider>
  );
};

export default ScriptEditor;
