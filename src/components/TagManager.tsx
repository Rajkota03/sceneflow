
import React from 'react';
import { ActType, Structure } from '@/lib/types';
import ActBar from './act-bar';
import { BeatMode, TagManagerProps } from '@/types/scriptTypes';
import useActCounts from './tag-manager/useActCounts';
import TagFilter from './tag-manager/TagFilter';
import useStructures from './tag-manager/useStructures';

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
  
  const selectedStructure = structures.find(s => s.id === selectedStructureId) || null;
  
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
  
  console.log('TagManager - Available structures:', structures.length);
  console.log('TagManager - Selected structure ID:', selectedStructureId);
  
  if (selectedStructure) {
    console.log('TagManager - Selected structure name:', selectedStructure.name);
    console.log('TagManager - Selected structure acts:', selectedStructure.acts?.length || 0);
  }

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
