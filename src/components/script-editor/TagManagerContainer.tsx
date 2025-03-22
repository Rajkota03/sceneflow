
import React from 'react';
import TagManager from '../TagManager';
import { useScriptEditor } from './ScriptEditorProvider';
import { Structure as ScriptStructure } from '@/types/scriptTypes';

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

  // Convert structures to the expected type if needed
  const scriptStructures: ScriptStructure[] = structures.map(structure => ({
    ...structure,
    createdAt: typeof structure.createdAt === 'string' ? structure.createdAt : structure.createdAt.toString(),
    updatedAt: typeof structure.updatedAt === 'string' ? structure.updatedAt : structure.updatedAt.toString()
  }));

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
      structures={scriptStructures}
      selectedStructureId={selectedStructureId || undefined}
      onStructureChange={handleStructureChange}
    />
  );
};

export default TagManagerContainer;
