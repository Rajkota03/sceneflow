
import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus } from 'lucide-react';

interface TagInputPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onInputKeyDown: (e: React.KeyboardEvent) => void;
  onTagAdd: () => void;
}

const TagInputPopover: React.FC<TagInputPopoverProps> = ({
  open,
  onOpenChange,
  inputValue,
  onInputChange,
  onInputKeyDown,
  onTagAdd
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className="h-6 px-2 text-xs rounded border border-dashed border-gray-300 text-gray-500 hover:bg-gray-100 flex items-center">
          <Plus size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-2 w-48">
        <div className="flex flex-col space-y-2">
          <p className="text-xs text-gray-500">Add a tag to this scene</p>
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onInputKeyDown}
              className="flex-1 h-8 px-2 text-xs rounded-l border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Tag name"
              autoFocus
            />
            <button
              onClick={onTagAdd}
              disabled={!inputValue.trim()}
              className="h-8 px-2 rounded-r text-xs bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300"
            >
              Add
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TagInputPopover;
