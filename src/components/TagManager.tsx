
import React, { useState, useEffect } from 'react';
import { ScriptContent, ActType } from '@/lib/types';
import SceneTag from './SceneTag';
import { Tags, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActBar from './ActBar';

interface TagManagerProps {
  scriptContent: ScriptContent;
  onFilterByTag: (tag: string | null) => void;
  onFilterByAct?: (act: ActType | null) => void;
  activeFilter: string | null;
  activeActFilter?: ActType | null;
}

const TagManager: React.FC<TagManagerProps> = ({ 
  scriptContent, 
  onFilterByTag,
  onFilterByAct,
  activeFilter,
  activeActFilter
}) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [actCounts, setActCounts] = useState<Record<ActType | string, number>>({
    1: 0,
    '2A': 0,
    'midpoint': 0,
    '2B': 0,
    3: 0
  });

  useEffect(() => {
    // Collect all unique tags from scene headings
    const tags = new Set<string>();
    const actTagCounts: Record<ActType | string, number> = {
      1: 0,
      '2A': 0,
      'midpoint': 0,
      '2B': 0,
      3: 0
    };

    scriptContent.elements.forEach(element => {
      if (element.type === 'scene-heading' && element.tags) {
        element.tags.forEach(tag => {
          tags.add(tag);
          
          // Count scenes by act tag
          if (tag.startsWith('Act 1:')) {
            actTagCounts[1]++;
          } else if (tag.startsWith('Act 2A:')) {
            actTagCounts['2A']++;
          } else if (tag.startsWith('Midpoint:')) {
            actTagCounts['midpoint']++;
          } else if (tag.startsWith('Act 2B:')) {
            actTagCounts['2B']++;
          } else if (tag.startsWith('Act 3:')) {
            actTagCounts[3]++;
          }
        });
      }
    });
    
    setAvailableTags(Array.from(tags));
    setActCounts(actTagCounts);
  }, [scriptContent]);

  const handleActFilter = (act: ActType | null) => {
    if (onFilterByAct) {
      onFilterByAct(act);
      // Clear tag filter when using act filter
      if (act !== null && activeFilter !== null) {
        onFilterByTag(null);
      }
    }
  };

  if (availableTags.length === 0 && Object.values(actCounts).every(count => count === 0)) {
    return null;
  }

  return (
    <div className="p-2 bg-slate-50 border border-slate-200 rounded-md mb-4">
      {onFilterByAct && (
        <ActBar 
          activeAct={activeActFilter || null} 
          onSelectAct={handleActFilter} 
          actCounts={actCounts}
        />
      )}
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center text-sm font-medium text-slate-700">
          <Tags size={16} className="mr-2" />
          <span>Scene Tags</span>
        </div>
        
        <div className="flex items-center">
          {activeFilter && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onFilterByTag(null)}
              className="h-7 text-xs mr-2 text-slate-600"
            >
              <X size={14} className="mr-1" />
              Clear Filter
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 text-xs"
          >
            {isExpanded ? "Hide" : "Show All"}
          </Button>
        </div>
      </div>
      
      {(isExpanded || activeFilter) && (
        <div className="flex flex-wrap items-center mt-2">
          {availableTags.map(tag => (
            <SceneTag
              key={tag}
              tag={tag}
              selectable
              selected={activeFilter === tag}
              onClick={() => onFilterByTag(activeFilter === tag ? null : tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TagManager;
