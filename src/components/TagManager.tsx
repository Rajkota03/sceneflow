
import React, { useState, useEffect } from 'react';
import { ScriptContent, ActType } from '@/lib/types';
import SceneTag from './SceneTag';
import { Tags, Filter, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActBar from './ActBar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

// Define BeatMode type to match ActBar
type BeatMode = 'on' | 'off';

interface TagManagerProps {
  scriptContent: ScriptContent;
  onFilterByTag: (tag: string | null) => void;
  onFilterByAct?: (act: ActType | null) => void;
  activeFilter: string | null;
  activeActFilter?: ActType | null;
  projectName?: string;
  structureName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  availableStructures?: { id: string; name: string }[];
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
}

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
  availableStructures = [],
  onStructureChange,
  selectedStructureId
}) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [actCounts, setActCounts] = useState<Record<ActType | string, number>>({
    1: 0,
    '2A': 0,
    'midpoint': 0,
    '2B': 0,
    3: 0
  });
  const [isTagsOpen, setIsTagsOpen] = useState(true);

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

  // Always render the ActBar so the user can toggle between modes
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        {onFilterByAct && (
          <ActBar 
            activeAct={activeActFilter || null} 
            onSelectAct={handleActFilter} 
            actCounts={actCounts}
            projectName={projectName}
            structureName={structureName}
            beatMode={beatMode}
            onToggleBeatMode={onToggleBeatMode}
            availableStructures={availableStructures}
            onStructureChange={onStructureChange}
            selectedStructureId={selectedStructureId}
          />
        )}
      </div>
      
      {beatMode === 'on' && availableTags.length > 0 && (
        <Collapsible open={isTagsOpen} onOpenChange={setIsTagsOpen} className="bg-white border border-slate-200 rounded-md">
          <div className="p-3">
            <div className="flex justify-between items-center">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 flex items-center">
                  <Tags size={16} className="mr-2" />
                  <span className="text-sm font-medium text-slate-700">Scene Tags</span>
                  {isTagsOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                </Button>
              </CollapsibleTrigger>
              
              {activeFilter && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onFilterByTag(null)}
                  className="h-7 text-xs text-slate-600"
                >
                  <X size={14} className="mr-1" />
                  Clear Filter
                </Button>
              )}
            </div>
            
            <CollapsibleContent>
              <div className="flex flex-wrap items-center gap-1 mt-2">
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
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
};

export default TagManager;
