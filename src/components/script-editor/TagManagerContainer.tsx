
import React from 'react';
import TagManager from '../TagManager';
import { useScriptEditor } from './ScriptEditorProvider';

const TagManagerContainer: React.FC = () => {
  const {
    elements,
    activeTagFilter,
    setActiveTagFilter,
    activeActFilter,
    setActiveActFilter,
    beatMode,
    setBeatMode,
    structures,
    selectedStructureId,
    handleStructureChange,
    projectId
  } = useScriptEditor();

  return (
    <TagManager
      scriptContent={{ elements }}
      onFilterByTag={setActiveTagFilter}
      onFilterByAct={setActiveActFilter}
      activeFilter={activeTagFilter}
      activeActFilter={activeActFilter}
      projectName={projectId ? undefined : "Untitled Project"}
      structureName={selectedStructureId ? undefined : "Three Act Structure"}
      beatMode={beatMode}
      onToggleBeatMode={setBeatMode}
      structures={structures}
      selectedStructureId={selectedStructureId || undefined}
      onStructureChange={handleStructureChange}
    />
  );
};

export default TagManagerContainer;
