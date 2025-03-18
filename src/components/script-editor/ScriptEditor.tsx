
import React, { useEffect } from 'react';
import { ScriptContent, Note } from '../../lib/types';
import { useFormat } from '@/lib/formatContext';
import ZoomControls from './ZoomControls';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import ScriptContent from './ScriptContent';
import TagManagerContainer from './TagManagerContainer';
import ScriptEditorProvider from './ScriptEditorProvider';
import { generateUniqueId } from '@/lib/formatScript';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';

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
      selectedStructureId={externalSelectedStructureId}
      onStructureChange={onStructureChange}
    >
      <ScriptEditorContent
        className={className}
        zoomPercentage={zoomPercentage} 
        onZoomChange={handleZoomChange}
      />
    </ScriptEditorProvider>
  );
};

interface ScriptEditorContentProps {
  className?: string;
  zoomPercentage: number;
  onZoomChange: (value: number[]) => void;
}

const ScriptEditorContent: React.FC<ScriptEditorContentProps> = ({
  className,
  zoomPercentage,
  onZoomChange
}) => {
  const { showKeyboardShortcuts } = useKeyboardShortcuts();

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <TagManagerContainer />
      
      {showKeyboardShortcuts && <KeyboardShortcutsHelp />}
      
      <div className="script-content-wrapper relative flex-grow h-full overflow-hidden">
        <ScriptContent />
      </div>
      
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={onZoomChange}
      />
    </div>
  );
};

export default ScriptEditor;
