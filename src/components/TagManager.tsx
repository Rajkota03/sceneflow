
import React, { useState } from 'react';
import { ActType, Structure, ScriptContent, BeatMode, TagManagerProps } from '@/types/scriptTypes';
import ActBar from './ActBar';
import useActCounts from './tag-manager/useActCounts';
import TagFilter from './tag-manager/TagFilter';
import StructureSelector from './tag-manager/StructureSelector';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Tag as TagIcon, Bookmark } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SceneTag from './SceneTag';
import { cn } from '@/lib/utils';

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
  try {
    const { availableTags, actCounts } = useActCounts(scriptContent);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const handleActFilter = (act: ActType | null) => {
      if (onFilterByAct) {
        onFilterByAct(act);
        // Clear tag filter when using act filter
        if (act !== null && activeFilter !== null && onFilterByTag) {
          onFilterByTag(null);
        }
      }
    };

    // Group tags by act type
    const getTagsByAct = () => {
      const act1Tags: string[] = [];
      const act2aTags: string[] = [];
      const midpointTags: string[] = [];
      const act2bTags: string[] = [];
      const act3Tags: string[] = [];
      const otherTags: string[] = [];
      
      availableTags.forEach(tag => {
        if (tag.startsWith('Act 1:')) act1Tags.push(tag);
        else if (tag.startsWith('Act 2A:')) act2aTags.push(tag);
        else if (tag.startsWith('Midpoint:')) midpointTags.push(tag);
        else if (tag.startsWith('Act 2B:')) act2bTags.push(tag);
        else if (tag.startsWith('Act 3:')) act3Tags.push(tag);
        else otherTags.push(tag);
      });
      
      return { act1Tags, act2aTags, midpointTags, act2bTags, act3Tags, otherTags };
    };
    
    const { act1Tags, act2aTags, midpointTags, act2bTags, act3Tags, otherTags } = getTagsByAct();
    
    // Find the first scene that has the specified tag
    const jumpToTaggedScene = (tag: string) => {
      if (onFilterByTag) {
        onFilterByTag(tag);
      }
    };

    return (
      <div className="mb-4 flex">
        {/* Main Collapsible wrapper to ensure CollapsibleTrigger has the right context */}
        <Collapsible
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          className="flex w-full"
        >
          {/* Sidebar for tagged scenes */}
          <div className={cn(
            "border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
            sidebarOpen ? "min-w-[250px] max-w-[250px]" : "w-0 overflow-hidden"
          )}>
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Bookmark size={14} className="mr-1" />
                  Scene Tags
                </h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ChevronLeft size={16} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <div className="overflow-y-auto max-h-[500px]">
                {/* Act 1 Tags */}
                {act1Tags.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-[#2171D2] mb-1">Act 1: Setup</h4>
                    <div className="space-y-1">
                      {act1Tags.map(tag => (
                        <SceneTag 
                          key={tag}
                          tag={tag} 
                          selectable 
                          selected={activeFilter === tag}
                          onClick={() => jumpToTaggedScene(tag)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Act 2A Tags */}
                {act2aTags.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-[#D28A21] mb-1">Act 2A: Reaction</h4>
                    <div className="space-y-1">
                      {act2aTags.map(tag => (
                        <SceneTag 
                          key={tag}
                          tag={tag} 
                          selectable 
                          selected={activeFilter === tag}
                          onClick={() => jumpToTaggedScene(tag)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Midpoint Tags */}
                {midpointTags.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-[#D24E4D] mb-1">Midpoint</h4>
                    <div className="space-y-1">
                      {midpointTags.map(tag => (
                        <SceneTag 
                          key={tag}
                          tag={tag} 
                          selectable 
                          selected={activeFilter === tag}
                          onClick={() => jumpToTaggedScene(tag)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Act 2B Tags */}
                {act2bTags.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-[#D26600] mb-1">Act 2B: Approach</h4>
                    <div className="space-y-1">
                      {act2bTags.map(tag => (
                        <SceneTag 
                          key={tag}
                          tag={tag} 
                          selectable 
                          selected={activeFilter === tag}
                          onClick={() => jumpToTaggedScene(tag)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Act 3 Tags */}
                {act3Tags.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-[#007F73] mb-1">Act 3: Resolution</h4>
                    <div className="space-y-1">
                      {act3Tags.map(tag => (
                        <SceneTag 
                          key={tag}
                          tag={tag} 
                          selectable 
                          selected={activeFilter === tag}
                          onClick={() => jumpToTaggedScene(tag)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Other custom tags */}
                {otherTags.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-600 mb-1">Custom Tags</h4>
                    <div className="space-y-1">
                      {otherTags.map(tag => (
                        <SceneTag 
                          key={tag}
                          tag={tag} 
                          selectable 
                          selected={activeFilter === tag}
                          onClick={() => jumpToTaggedScene(tag)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {availableTags.length === 0 && (
                  <div className="text-xs text-gray-500 italic">
                    No tagged scenes yet. Hover over a scene heading and click "Tag Scene" to add tags.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {!sidebarOpen && (
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mr-2 h-8 w-8 p-0"
                      title="Show Tags Sidebar"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </CollapsibleTrigger>
                )}
                
                {onFilterByAct && (
                  <ActBar 
                    activeAct={activeActFilter} 
                    onSelectAct={handleActFilter} 
                    actCounts={actCounts}
                    projectName={projectName}
                    beatMode={beatMode}
                    onToggleBeatMode={onToggleBeatMode}
                    availableStructures={structures?.map(s => ({ id: s.id, name: s.name }))}
                    selectedStructureId={selectedStructureId}
                    onStructureChange={onStructureChange}
                    selectedStructure={selectedStructure}
                  />
                )}
              </div>
            </div>
            
            {/* Structure selector with improved UI */}
            {structures && structures.length > 0 && onStructureChange && (
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
        </Collapsible>
      </div>
    );
  } catch (error) {
    console.error("Error rendering TagManager:", error);
    // Fallback UI in case something goes wrong
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
        <h3 className="text-sm font-medium text-yellow-800">Tag manager could not be loaded</h3>
        <p className="text-xs text-yellow-700 mt-1">
          This doesn't affect your screenplay. Continue editing below.
        </p>
      </div>
    );
  }
};

export default TagManager;
