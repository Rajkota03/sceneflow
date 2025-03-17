
import React from 'react';
import { ActType, Structure } from '@/lib/types';
import ActBar from './ActBar';
import { BeatMode, TagManagerProps } from '@/types/scriptTypes';
import useActCounts from './tag-manager/useActCounts';
import TagFilter from './tag-manager/TagFilter';
import StructureSelector from './tag-manager/StructureSelector';

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
  structures = [],
  selectedStructure
}) => {
  const { availableTags, actCounts } = useActCounts(scriptContent);
  
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
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        {onFilterByAct && (
          <ActBar 
            activeAct={activeActFilter || null} 
            onSelectAct={handleActFilter} 
            actCounts={actCounts}
            projectName={projectName}
            beatMode={beatMode}
            onToggleBeatMode={onToggleBeatMode}
            availableStructures={structures.map(s => ({ id: s.id, name: s.name }))}
            selectedStructureId={selectedStructureId}
            onStructureChange={onStructureChange}
            selectedStructure={selectedStructure}
          />
        )}
      </div>
      
      {/* Structure selector with improved UI */}
      {structures.length > 0 && onStructureChange && (
        <StructureSelector
          structures={structures}
          selectedStructureId={selectedStructureId}
          onStructureChange={onStructureChange}
        />
      )}
      
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
