
import React from 'react';
import { ActType, Structure } from '@/lib/types';
import ActBar from './ActBar';
import { BeatMode, TagManagerProps } from '@/types/scriptTypes';
import useActCounts from './tag-manager/useActCounts';
import TagFilter from './tag-manager/TagFilter';
import { FileTextIcon } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
            onStructureChange={onStructureChange}
            selectedStructureId={selectedStructureId}
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
