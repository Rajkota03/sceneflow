
import React, { useState, useMemo } from 'react';
import { ScriptContent, ActType, Structure } from '@/lib/types';
import ActBar from './act-bar/ActBar';
import TagFilter from './tag-manager/TagFilter';
import useActCounts from './tag-manager/useActCounts';
import { BeatMode } from '@/types/scriptTypes';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import BeatModeToggle from './act-bar/BeatModeToggle';
import { cn } from '@/lib/utils';

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
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Button variant="ghost" size="sm" className="mr-2">
          <ArrowLeft size={16} />
        </Button>
        <div className="text-sm font-medium flex-1 flex items-center">
          <span className="inline-block truncate max-w-[220px]">
            {projectName || "Untitled Screenplay"}
          </span>
          <div className="mx-2 text-gray-400">·</div>
          <span className="text-gray-500 text-sm font-normal">
            {selectedStructure?.name || structureName}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>
            Notes
          </Button>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
          <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save
          </Button>
        </div>
      </div>
      
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
        
        {/* Structure Bar - Fixed with properly typed props */}
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
