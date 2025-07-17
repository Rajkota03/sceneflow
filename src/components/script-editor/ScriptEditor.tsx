
import React from 'react';
import { ScriptContent as ScriptContentType } from '../../lib/types';
import { useFormat } from '@/lib/formatContext';
import ScriptEditorProvider from './ScriptEditorProvider';
import ScreenplayView from '../prosemirror/ScreenplayView';
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

const ScriptEditor = ({ 
  initialContent, 
  onChange, 
  notes, 
  onNoteCreate, 
  className,
  projectName = "Untitled Project",
  structureName = "Three Act Structure",
  projectId,
  onStructureChange,
  selectedStructureId: externalSelectedStructureId,
  beatMode = 'on',
  onToggleBeatMode
}: ScriptEditorProps) => {
  return (
    <ScriptEditorProvider
      initialContent={initialContent}
      onChange={onChange}
      projectId={projectId}
      projectTitle={projectName}
    >
      <ScreenplayView
        content={initialContent}
        onChange={onChange}
        notes={notes}
        onNoteCreate={onNoteCreate}
        className={className}
        projectName={projectName}
        structureName={structureName}
        projectId={projectId}
        beatMode={beatMode}
      />
    </ScriptEditorProvider>
  );
};

export default ScriptEditor;
