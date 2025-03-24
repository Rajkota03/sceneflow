
import React from 'react';
import { ScriptContent } from '@/lib/types';
import { BeatMode } from '@/types/scriptTypes';
import { Button } from '@/components/ui/button';
import { Info, List } from 'lucide-react';

interface TagManagerContainerProps {
  scriptContent: ScriptContent;
  onFilterByTag?: (tag: string | null) => void;
  activeFilter?: string | null;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  selectedStructureId?: string | null;
  onStructureChange?: (structureId: string) => void;
}

const TagManagerContainer: React.FC<TagManagerContainerProps> = ({
  scriptContent,
  onFilterByTag,
  activeFilter,
  beatMode = 'on',
  onToggleBeatMode,
  selectedStructureId,
  onStructureChange
}) => {
  // Get all unique tags from script elements
  const allTags = React.useMemo(() => {
    if (!scriptContent.elements) return [];
    
    const tags: string[] = [];
    scriptContent.elements.forEach(element => {
      if (element.tags && element.tags.length > 0) {
        element.tags.forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
      }
    });
    
    return tags.sort();
  }, [scriptContent]);

  // Toggle the beat view mode
  const toggleBeatMode = () => {
    if (onToggleBeatMode) {
      onToggleBeatMode(beatMode === 'on' ? 'off' : 'on');
    }
  };

  // If there are no tags, render minimal UI
  if (allTags.length === 0) {
    return (
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No tags added
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleBeatMode}
            className="text-xs"
          >
            {beatMode === 'on' ? 'Hide Beat Mode' : 'Show Beat Mode'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <List size={16} className="mr-1" />
          Tags:
        </span>
        
        {activeFilter && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onFilterByTag && onFilterByTag(null)}
            className="text-xs mr-2"
          >
            Clear Filter
          </Button>
        )}
        
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => onFilterByTag && onFilterByTag(tag)}
            className={`px-2 py-1 rounded text-xs ${
              activeFilter === tag
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tag}
          </button>
        ))}
        
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleBeatMode}
            className="text-xs"
          >
            {beatMode === 'on' ? 'Hide Beat Mode' : 'Show Beat Mode'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TagManagerContainer;
