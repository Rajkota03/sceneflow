
import React from 'react';
import { ScriptContent, Note } from '@/lib/types';
import { useFormat } from '@/lib/formatContext';
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

const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
  initialContent, 
  onChange, 
  className,
  projectName = "Untitled Project",
}) => {
  return (
    <div className={`w-full h-full bg-white dark:bg-slate-800 p-4 ${className || ''}`}>
      <div className="text-center p-10 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Screenplay Editor</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The screenplay editor has been reset and will be rebuilt from scratch.
        </p>
      </div>
    </div>
  );
};

export default ScriptEditor;
