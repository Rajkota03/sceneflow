
import React from 'react';
import { Button } from '../ui/button';
import { Tag } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  activeFilter: string | null;
  onFilterByTag: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, activeFilter, onFilterByTag }) => {
  if (tags.length === 0) return null;
  
  return (
    <div className="mb-2">
      <div className="flex items-center mb-1.5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <Tag size={16} className="mr-1.5" />
          Scene Tags
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterByTag(null)}
          className="h-7 px-3 text-xs"
        >
          All Tags
        </Button>
        
        {tags.map(tag => (
          <Button
            key={tag}
            variant={activeFilter === tag ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterByTag(tag)}
            className="h-7 px-3 text-xs"
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
