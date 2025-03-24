
import React from 'react';
import ScriptEditor from './ScriptEditor';
import { useScriptEditor } from './ScriptEditorProvider';

interface ScriptEditorContentProps {
  zoomPercentage: number;
  onZoomChange: (value: number[]) => void;
}

const ScriptEditorContent: React.FC<ScriptEditorContentProps> = ({
  zoomPercentage,
  onZoomChange
}) => {
  const {
    elements,
    handleElementChange,
    activeElementId,
    scriptContentRef,
    activeTagFilter,
    setActiveTagFilter,
    beatMode,
    selectedStructureId,
    handleStructureChange,
    setBeatMode,
    projectId
  } = useScriptEditor();

  return (
    <div className="flex justify-center items-center h-full w-full" ref={scriptContentRef}>
      <ScriptEditor
        initialContent={{ elements }}
        onChange={(content) => {
          if (content?.elements) {
            handleElementChange(content);
          }
        }}
        className="w-full h-full"
        projectId={projectId}
        selectedStructureId={selectedStructureId}
        onStructureChange={handleStructureChange}
        beatMode={beatMode}
        onToggleBeatMode={setBeatMode}
      />
    </div>
  );
};

export default ScriptEditorContent;
