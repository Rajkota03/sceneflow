
import React, { useState, useEffect } from 'react';
import { ScriptElement } from '@/lib/types';
import TagInput from './TagInput';
import { Tags } from 'lucide-react';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
}

const SceneTags: React.FC<SceneTagsProps> = ({ element, onTagsChange }) => {
  const [tags, setTags] = useState<string[]>(element.tags || []);

  useEffect(() => {
    setTags(element.tags || []);
  }, [element.tags]);

  const handleAddTag = (tag: string) => {
    const newTags = [...tags, tag];
    setTags(newTags);
    onTagsChange(element.id, newTags);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onTagsChange(element.id, newTags);
  };

  if (element.type !== 'scene-heading') {
    return null;
  }

  return (
    <div className="my-1 ml-1">
      <div className="flex items-center text-gray-500 mb-1">
        <Tags size={14} className="mr-1" />
        <span className="text-xs font-medium">Scene Tags</span>
      </div>
      <TagInput
        tags={tags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    </div>
  );
};

export default SceneTags;
