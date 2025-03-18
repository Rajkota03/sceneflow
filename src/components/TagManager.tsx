
import React from 'react';
import { ActType, Structure, StructureType } from '@/lib/types';
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
  
  // Determine the structure type based on the selected structure
  const getStructureType = (): StructureType => {
    if (!selectedStructureId || !structures.length) return 'three_act';
    
    const selectedStructure = structures.find(s => s.id === selectedStructureId);
    return (selectedStructure?.structure_type as StructureType) || 'three_act';
  };
  
  const structureType = getStructureType();
  
  const handleActFilter = (act: ActType | null) => {
    if (onFilterByAct) {
      onFilterByAct(act);
      // Clear tag filter when using act filter
      if (act !== null && activeFilter !== null && onFilterByTag) {
        onFilterByTag(null);
      }
    }
  };

  return (
    <div className="mb-4 overflow-visible">
      <div className="mb-2">
        {onFilterByAct && (
          <ActBar 
            activeAct={activeActFilter || null} 
            onSelectAct={handleActFilter} 
            actCounts={actCounts}
            projectName={projectName}
            beatMode={beatMode}
            onToggleBeatMode={onToggleBeatMode}
            availableStructures={structures.map(s => ({ id: s.id, name: s.name }))}
            onStructureChange={onStructureChange}
            selectedStructureId={selectedStructureId}
            selectedStructureType={structureType}
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
