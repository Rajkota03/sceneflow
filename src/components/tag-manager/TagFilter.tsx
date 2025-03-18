
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { X, Tag } from 'lucide-react';
import SceneTag from '../SceneTag';

interface TagFilterProps {
  availableTags: string[];
  activeFilter: string | null;
  onFilterByTag: ((tag: string | null) => void) | undefined;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  availableTags, 
  activeFilter, 
  onFilterByTag 
}) => {
  if (!availableTags.length) return null;
  
  return (
    <div className="mb-2 flex flex-wrap gap-1">
      {availableTags.map((tag) => (
        <SceneTag
          key={tag}
          tag={tag}
          selectable={true}
          selected={activeFilter === tag}
          onClick={() => onFilterByTag && onFilterByTag(activeFilter === tag ? null : tag)}
        />
      ))}
      
      {activeFilter && (
        <Badge 
          variant="outline" 
          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer ml-2"
          onClick={() => onFilterByTag && onFilterByTag(null)}
        >
          <X className="h-3 w-3 mr-1" />
          Clear Filter
        </Badge>
      )}
    </div>
  );
};

export default TagFilter;
