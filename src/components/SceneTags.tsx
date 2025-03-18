
import React, { useState } from 'react';
import { ScriptElement, Structure } from '@/lib/types';
import { Tag, Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from './ui/button';
import { Input } from './ui/input';
import SceneTag from './SceneTag';
import { cn } from '@/lib/utils';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const SceneTags: React.FC<SceneTagsProps> = ({
  element,
  onTagsChange,
  projectId,
  selectedStructure,
  onBeatTag
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTagClick = (beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(element.id, beatId, actId);
      setIsOpen(false);
    }
  };

  // Filter beats based on search query
  const getFilteredBeats = (act: any) => {
    if (!act.beats || !Array.isArray(act.beats)) return [];
    
    return act.beats.filter(beat => 
      beat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get the appropriate color for the tag button based on existing tags
  const getTagButtonStyle = () => {
    if (!element.tags || element.tags.length === 0) return "text-gray-500";
    
    if (element.tags.some(tag => tag.startsWith('Act 1:'))) return "text-blue-600";
    if (element.tags.some(tag => tag.startsWith('Act 2A:'))) return "text-yellow-600";
    if (element.tags.some(tag => tag.startsWith('Midpoint:'))) return "text-red-600";
    if (element.tags.some(tag => tag.startsWith('Act 2B:'))) return "text-orange-600";
    if (element.tags.some(tag => tag.startsWith('Act 3:'))) return "text-green-600";
    
    return "text-purple-600"; // Default for other tags
  };

  if (!selectedStructure || !selectedStructure.acts || !Array.isArray(selectedStructure.acts) || selectedStructure.acts.length === 0) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Tag className="h-4 w-4 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-2">
          <div className="text-xs text-gray-500 p-2">
            No structure selected or structure has no acts/beats.
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Display existing tags
  const existingTags = element.tags || [];
  
  return (
    <div className="scene-tags-container">
      {existingTags.length > 0 && (
        <div className="flex flex-wrap mb-1 mx-1">
          {existingTags.map((tag, index) => (
            <SceneTag 
              key={index} 
              tag={tag} 
              onRemove={() => {
                const newTags = existingTags.filter((_, i) => i !== index);
                onTagsChange(element.id, newTags);
              }}
            />
          ))}
        </div>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-6 w-6 p-0 opacity-50 hover:opacity-100 transition-opacity",
              getTagButtonStyle()
            )}
          >
            <Tag className={cn("h-4 w-4", getTagButtonStyle())} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="end">
          <div className="p-2 border-b">
            <h3 className="font-semibold text-sm mb-2">Tag Scene with Story Beat</h3>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search beats..."
                className="pl-8 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="p-2 max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {selectedStructure.acts.map((act) => {
                const filteredBeats = getFilteredBeats(act);
                if (filteredBeats.length === 0) return null;
                
                // Define colors based on act type
                let headerColor = "text-gray-600";
                let beatItemClass = "hover:bg-gray-100";
                
                if (act.title.includes("Act 1")) {
                  headerColor = "text-blue-600";
                  beatItemClass = "hover:bg-blue-50";
                } else if (act.title.includes("Act 2A")) {
                  headerColor = "text-yellow-600";
                  beatItemClass = "hover:bg-yellow-50";
                } else if (act.title.includes("Midpoint")) {
                  headerColor = "text-red-600";
                  beatItemClass = "hover:bg-red-50";
                } else if (act.title.includes("Act 2B")) {
                  headerColor = "text-orange-600";
                  beatItemClass = "hover:bg-orange-50";
                } else if (act.title.includes("Act 3")) {
                  headerColor = "text-green-600";
                  beatItemClass = "hover:bg-green-50";
                }
                
                return (
                  <div key={act.id}>
                    <h4 className={`text-xs font-medium ${headerColor} mb-1`}>
                      {act.title}
                    </h4>
                    <div className="space-y-1">
                      {filteredBeats.map((beat) => (
                        <button
                          key={beat.id}
                          onClick={() => handleTagClick(beat.id, act.id)}
                          className={`w-full text-left py-1.5 px-2 text-xs rounded-md transition-colors ${beatItemClass}`}
                        >
                          {beat.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SceneTags;
