
import React from 'react';
import { ActType, Structure } from '@/lib/types';
import ActBar from './act-bar';
import { BeatMode, TagManagerProps } from '@/types/scriptTypes';
import useActCounts from './tag-manager/useActCounts';
import TagFilter from './tag-manager/TagFilter';
import { useScriptEditor } from './script-editor/ScriptEditorProvider';

interface ActCount {
  act: ActType | null;
  count: number;
}

const TagManager: React.FC<TagManagerProps> = ({ 
  scriptContent, 
  onFilterByTag,
  onFilterByAct,
  activeFilter,
  activeActFilter,
  projectName,
  structureName,
  beatMode = 'on',
  onToggleBeatMode,
  selectedStructureId,
  onStructureChange,
  structures = []
}) => {
  const { availableTags, actCounts } = useActCounts(scriptContent);
  const { beatSceneCounts, selectedStructure } = useScriptEditor();
  
  const actCountsArray: ActCount[] = Object.entries(actCounts).map(([act, count]) => ({
    act: act as ActType,
    count
  }));
  
  const handleActFilter = (act: ActType | null) => {
    if (onFilterByAct) {
      onFilterByAct(act);
      if (act !== null && activeFilter !== null && onFilterByTag) {
        onFilterByTag(null);
      }
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        {onFilterByAct && (
          <ActBar 
            activeAct={activeActFilter || null} 
            onSelectAct={handleActFilter} 
            actCounts={actCountsArray}
            projectName={projectName}
            structureName={selectedStructure?.name || structureName}
            beatMode={beatMode}
            onToggleBeatMode={onToggleBeatMode}
            selectedStructure={selectedStructure}
            beatSceneCounts={beatSceneCounts}
            onStructureChange={onStructureChange}
            selectedStructureId={selectedStructureId}
            availableStructures={structures.map(s => ({ id: s.id, name: s.name }))}
          />
        )}
      </div>
      
      {beatMode === 'on' && availableTags.length > 0 && (
        <TagFilter 
          availableTags={availableTags}
          activeFilter={activeFilter}
          onFilterByTag={onFilterByTag}
        />
      )}
    </div>
  );
};

export default TagManager;
