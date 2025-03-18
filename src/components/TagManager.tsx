
import React from 'react';
import { ActType, Structure } from '@/lib/types';
import ActBar from './ActBar';
import { BeatMode, TagManagerProps } from '@/types/scriptTypes';
import useActCounts from './tag-manager/useActCounts';
import TagFilter from './tag-manager/TagFilter';

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
  
  // Find the selected structure from the list
  const selectedStructure = structures.find(s => s.id === selectedStructureId) || null;
  
  const handleActFilter = (act: ActType | null) => {
    if (onFilterByAct) {
      onFilterByAct(act);
      // Clear tag filter when using act filter
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
            actCounts={actCounts}
            projectName={projectName}
            structureName={selectedStructure?.name || structureName}
            beatMode={beatMode}
            onToggleBeatMode={onToggleBeatMode}
            availableStructures={structures.map(s => ({ id: s.id, name: s.name }))}
            onStructureChange={onStructureChange}
            selectedStructureId={selectedStructureId}
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
