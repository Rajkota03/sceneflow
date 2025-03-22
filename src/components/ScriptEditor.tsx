
import React from 'react';
import { ScriptContent, Note } from '@/lib/types';
import { useFormat } from '@/lib/formatContext';
import { BeatMode } from '@/types/scriptTypes';
import ScriptEditor as NewScriptEditor from './script-editor/ScriptEditor';

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

const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
  initialContent, 
  onChange, 
  className,
  projectName = "Untitled Project",
  projectId,
  onStructureChange,
  selectedStructureId,
  beatMode = 'on',
  onToggleBeatMode
}) => {
  return (
    <NewScriptEditor
      initialContent={initialContent}
      onChange={onChange}
      className={className}
      projectName={projectName}
      projectId={projectId}
      selectedStructureId={selectedStructureId}
      onStructureChange={onStructureChange}
      beatMode={beatMode}
      onToggleBeatMode={onToggleBeatMode}
    />
  );
};

export default ScriptEditor;
