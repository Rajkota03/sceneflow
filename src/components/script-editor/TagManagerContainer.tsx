
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
    onToggleBeatMode,
    projectId,
    projectTitle,
    selectedStructure,
    selectedStructureId,
    onStructureChange,
    availableStructures,
    activeBeatId,
    setActiveBeatId,
    beatSceneCounts
  } = useScriptEditor();

  const handleBeatClick = (beatId: string) => {
    setActiveBeatId(beatId);
  };

  return (
    <TagManager
      scriptContent={{ elements: elements || [] }}
      onFilterByTag={setActiveTagFilter}
      onFilterByAct={setActiveActFilter}
      activeFilter={activeTagFilter}
      activeActFilter={activeActFilter}
      projectName={projectTitle || (projectId ? undefined : "Untitled Screenplay")}
      structureName={selectedStructure?.name || "Three Act Structure"}
      projectId={projectId}
      beatMode={beatMode}
      onToggleBeatMode={onToggleBeatMode}
      selectedStructure={selectedStructure}
      selectedStructureId={selectedStructureId}
      onStructureChange={onStructureChange}
      availableStructures={availableStructures}
      activeBeatId={activeBeatId}
      onBeatClick={handleBeatClick}
      beatSceneCounts={beatSceneCounts}
    />
  );
};

export default TagManagerContainer;
