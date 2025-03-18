
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
    projectTitle
  } = useScriptEditor();

  return (
    <TagManager
      scriptContent={{ elements: elements || [] }}
      onFilterByTag={setActiveTagFilter}
      onFilterByAct={setActiveActFilter}
      activeFilter={activeTagFilter}
      activeActFilter={activeActFilter}
      projectName={projectTitle || (projectId ? undefined : "Untitled Screenplay")}
      structureName={"Three Act Structure"}
      projectId={projectId}
      beatMode={beatMode}
      onToggleBeatMode={onToggleBeatMode}
    />
  );
};

export default TagManagerContainer;
