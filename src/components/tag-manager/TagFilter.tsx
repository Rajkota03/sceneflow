
import React, { useState } from 'react';
import { Tags, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SceneTag from '../SceneTag';

interface TagFilterProps {
  availableTags: string[];
  activeFilter: string | null;
  onFilterByTag: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  availableTags, 
  activeFilter, 
  onFilterByTag 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-white border border-slate-200 rounded-md">
      <div className="p-3">
        <div className="flex justify-between items-center">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 flex items-center">
              <Tags size={16} className="mr-2" />
              <span className="text-sm font-medium text-slate-700">Scene Tags</span>
              {isOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
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
  );
};

export default TagFilter;
