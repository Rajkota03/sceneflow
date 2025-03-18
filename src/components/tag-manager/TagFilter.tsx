
import React from 'react';
import { FilterX, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TagFilterProps {
  tags: string[];
  activeFilter: string | null;
  onFilterByTag: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, activeFilter, onFilterByTag }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags
        </h3>
        {activeFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterByTag(null)}
            className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400"
          >
            <FilterX size={14} className="mr-1" />
            Clear filter
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Button
            key={tag}
            variant={activeFilter === tag ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterByTag(tag)}
            className={`h-7 px-2 text-xs ${
              activeFilter === tag
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            <Tag size={12} className="mr-1" />
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
