
import React, { useState, useEffect } from 'react';
import { ScriptContent } from '@/lib/types';
import SceneTag from './SceneTag';
import { Tags, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TagManagerProps {
  scriptContent: ScriptContent;
  onFilterByTag: (tag: string | null) => void;
  activeFilter: string | null;
}

const TagManager: React.FC<TagManagerProps> = ({ 
  scriptContent, 
  onFilterByTag,
  activeFilter
}) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Collect all unique tags from scene headings
    const tags = new Set<string>();
    scriptContent.elements.forEach(element => {
      if (element.type === 'scene-heading' && element.tags) {
        element.tags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
  }, [scriptContent]);

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="p-2 bg-slate-50 border border-slate-200 rounded-md mb-4">
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
