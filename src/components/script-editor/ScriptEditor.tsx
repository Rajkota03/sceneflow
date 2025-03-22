
import React from 'react';
import { ScriptContent as ScriptContentType } from '../../lib/types';
import { useFormat } from '@/lib/formatContext';
import ScriptEditorProvider from './ScriptEditorProvider';
import ScriptEditorContent from './ScriptEditorContent';
import { Note } from '@/lib/types';
import { BeatMode } from '@/types/scriptTypes';

interface ScriptEditorProps {
  initialContent: ScriptContentType;
  onChange: (content: ScriptContentType) => void;
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

const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
  initialContent, 
  onChange, 
  notes, 
  onNoteCreate, 
  className,
  projectName = "Untitled Project",
  structureName = "Three Act Structure",
  projectId,
  onStructureChange,
  selectedStructureId,
  beatMode = 'on',
  onToggleBeatMode,
}: ScriptEditorProps) => {
  const { formatState, setZoomLevel } = useFormat();
  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  };

  return (
    <ScriptEditorProvider
      initialContent={initialContent}
      onChange={onChange}
      projectId={projectId}
      selectedStructureId={selectedStructureId}
      onStructureChange={onStructureChange}
      beatMode={beatMode}
      onToggleBeatMode={onToggleBeatMode}
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
