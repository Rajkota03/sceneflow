
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
      structureName={"Three Act Structure"}
      projectId={projectId}
      beatMode={beatMode}
    />
  );
};

export default TagManagerContainer;
