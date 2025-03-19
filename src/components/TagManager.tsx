
import React, { useState, useMemo } from 'react';
import { ScriptContent, ActType, Structure } from '@/lib/types';
import ActBar from './act-bar/ActBar';
import TagFilter from './tag-manager/TagFilter';
import useActCounts from './tag-manager/useActCounts';
import { BeatMode } from '@/types/scriptTypes';
import { Button } from './ui/button';
import BeatModeToggle from './act-bar/BeatModeToggle';
import { cn } from '@/lib/utils';
import { useScriptEditor } from './script-editor/ScriptEditorProvider';

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
  selectedStructure?: Structure | null;
  activeBeatId?: string | null;
  onBeatClick?: (beatId: string) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ 
  scriptContent, 
  onFilterByTag, 
  onFilterByAct,
  activeFilter,
  activeActFilter,
  projectName = "Untitled Project", 
  structureName = "Three Act Structure",
  projectId,
  beatMode = 'on',
  onToggleBeatMode,
  selectedStructure,
  activeBeatId,
  onBeatClick
}) => {
  // Get scene counts for beats from context
  const { beatSceneCounts } = useScriptEditor();
  
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
  
  return (
    <div className="bg-white dark:bg-slate-850 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Removed the first header bar with project name */}
      
      <div className="px-4 py-3">
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M9 15h.01"/><path d="M15 15h.01"/></svg>
                Story Structure
              </h3>
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-2">
            {onToggleBeatMode && (
              <div className="flex space-x-2 items-center">
                <BeatModeToggle 
                  beatMode={beatMode} 
                  onToggleBeatMode={onToggleBeatMode} 
                />
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    `h-8 px-3 text-xs text-gray-600 dark:text-gray-400`
                  )}
                >
                  Free Mode
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Structure Bar - Enhanced with beat scene counts */}
        <ActBar 
          activeAct={activeActFilter}
          onSelectAct={onFilterByAct}
          actCounts={actCounts}
          projectName={projectName}
          structureName={structureName}
          selectedStructure={selectedStructure}
          beatMode={beatMode}
          activeBeatId={activeBeatId}
          onBeatClick={onBeatClick}
          beatSceneCounts={beatSceneCounts}
        />
        
        {allTags.length > 0 && (
          <TagFilter 
            tags={allTags}
            activeFilter={activeFilter}
            onFilterByTag={onFilterByTag}
          />
        )}
      </div>
    </div>
  );
};

export default TagManager;
