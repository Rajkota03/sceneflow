
import React from 'react';
import TagManager from '../TagManager';
import { useScriptEditor } from './ScriptEditorProvider';
import { Structure as ScriptStructure } from '@/types/scriptTypes';
import { Structure as LibStructure } from '@/lib/types';

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

  // Convert structures to the expected type with proper type checking
  const scriptStructures: ScriptStructure[] = structures.map((structure: LibStructure) => ({
    ...structure,
    createdAt: typeof structure.createdAt === 'string' 
      ? structure.createdAt 
      : new Date(structure.createdAt || '').toISOString(),
    updatedAt: typeof structure.updatedAt === 'string' 
      ? structure.updatedAt 
      : new Date(structure.updatedAt || '').toISOString()
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
