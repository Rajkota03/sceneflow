
import React from 'react';
import TagManager from '@/components/TagManager';
import { BeatMode } from '@/types/scriptTypes';
import { useScriptEditor } from './ScriptEditorProvider';

interface TagManagerContainerProps {
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  projectId?: string;
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  structures?: { id: string; name: string }[];
}

const TagManagerContainer: React.FC<TagManagerContainerProps> = ({
  beatMode = 'on',
  onToggleBeatMode,
  projectId,
  onStructureChange,
  selectedStructureId,
  structures = []
}) => {
  const scriptEditor = useScriptEditor();
  const scriptTitle = scriptEditor.projectTitle || 'Untitled';

  return (
    <TagManager
      scriptContent={{ elements: scriptEditor.elements || [] }}
      onFilterByTag={() => {}}
      onFilterByAct={() => {}}
      projectName={scriptTitle}
      structureName="Three Act Structure"
      beatMode={beatMode}
      onToggleBeatMode={onToggleBeatMode}
      selectedStructureId={selectedStructureId}
      onStructureChange={onStructureChange}
      structures={structures}
    />
  );
};

export default TagManagerContainer;
