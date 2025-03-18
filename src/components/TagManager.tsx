
import React, { useState, useEffect, useMemo } from 'react';
import { ScriptContent, ActType, Structure } from '@/lib/types';
import ActBar from './act-bar/ActBar';
import TagFilter from './tag-manager/TagFilter';
import useActCounts from './tag-manager/useActCounts';
import { BeatMode } from '@/types/scriptTypes';
import useProjectStructures from '@/hooks/useProjectStructures';

interface TagManagerProps {
  scriptContent: ScriptContent;
  onFilterByTag: (tag: string | null) => void;
  onFilterByAct: (act: ActType | null) => void;
  activeFilter: string | null;
  activeActFilter: ActType | null;
  projectName?: string;
  structureName?: string;
  projectId?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ 
  scriptContent, 
  onFilterByTag, 
  onFilterByAct,
  activeFilter,
  activeActFilter,
  projectName = "Untitled Project", 
  structureName = "Three Act Structure",
  projectId
}) => {
  // Extract all unique tags from scriptContent
  const allTags = useMemo(() => {
    if (!scriptContent || !scriptContent.elements) return [];
    
    const tagSet = new Set<string>();
    
    scriptContent.elements.forEach(element => {
      if (element.tags && Array.isArray(element.tags)) {
        element.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet).sort();
  }, [scriptContent]);

  // Get act counts - now properly converting to array format
  const { actCounts: actCountsRecord } = useActCounts(scriptContent);
  
  // Convert the ActCountsRecord to an array of ActCount objects
  const actCounts = Object.entries(actCountsRecord).map(([act, count]) => ({
    act: act as ActType,
    count
  }));
  
  // Get structure data if a projectId is provided
  const { selectedStructure } = useProjectStructures(projectId);
  
  return (
    <div className="bg-white dark:bg-slate-850 p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="space-y-4">
        {allTags.length > 0 && (
          <TagFilter 
            tags={allTags}
            activeFilter={activeFilter}
            onFilterByTag={onFilterByTag}
          />
        )}
        
        <ActBar 
          activeAct={activeActFilter}
          onSelectAct={onFilterByAct}
          actCounts={actCounts}
          projectName={projectName}
          structureName={structureName}
          selectedStructure={selectedStructure}
        />
      </div>
    </div>
  );
};

export default TagManager;
