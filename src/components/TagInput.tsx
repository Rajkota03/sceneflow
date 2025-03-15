
import React, { useState, useRef, useEffect } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SceneTag from './SceneTag';

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  onAddTag, 
  onRemoveTag,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputVisible]);

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onAddTag(trimmedValue);
      setInputValue('');
    } else {
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
    if (e.key === 'Escape') {
      setIsInputVisible(false);
      setInputValue('');
    }
  };

  return (
    <div className={`flex flex-wrap items-center ${className}`}>
      {tags.map((tag) => (
        <SceneTag 
          key={tag} 
          tag={tag} 
          onRemove={() => onRemoveTag(tag)} 
        />
      ))}
      
      {isInputVisible ? (
        <div className="inline-flex items-center">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              handleAddTag();
              setIsInputVisible(false);
            }}
            className="w-24 h-6 text-xs py-1 px-2"
            placeholder="Add tag..."
          />
        </div>
      ) : (
        <button 
          onClick={() => setIsInputVisible(true)}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <Plus size={12} className="mr-1" />
          <span>Add Tag</span>
        </button>
      )}
    </div>
  );
};

export default TagInput;
