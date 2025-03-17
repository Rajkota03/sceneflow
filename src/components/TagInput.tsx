
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
  
  // Get color for act tags
  const getTagColor = (tag: string): string => {
    if (tag.startsWith('Act 1:')) return 'bg-[#D3E4FD] text-[#2171D2]';
    if (tag.startsWith('Act 2A:')) return 'bg-[#FEF7CD] text-[#D28A21]';
    if (tag.startsWith('Midpoint:')) return 'bg-[#FFCCCB] text-[#D24E4D]';
    if (tag.startsWith('Act 2B:')) return 'bg-[#FDE1D3] text-[#D26600]';
    if (tag.startsWith('Act 3:')) return 'bg-[#F2FCE2] text-[#007F73]';
    return '';
  };

  return (
    <div className={className}>
      <div className="text-xs font-medium mb-1 text-gray-500">Tags</div>
      <div className="flex flex-wrap items-center">
        {tags.map((tag) => (
          <div 
            key={tag} 
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs mr-1 mb-1 ${
              tag.startsWith('Act 1:') || 
              tag.startsWith('Act 2A:') || 
              tag.startsWith('Midpoint:') || 
              tag.startsWith('Act 2B:') || 
              tag.startsWith('Act 3:') ? getTagColor(tag) : 'bg-slate-100 text-slate-700'
            }`}
          >
            <TagIcon size={12} className="mr-1" />
            <span>{tag}</span>
            <button 
              onClick={() => onRemoveTag(tag)}
              className="ml-1 hover:text-red-500"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
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
    </div>
  );
};

export default TagInput;
