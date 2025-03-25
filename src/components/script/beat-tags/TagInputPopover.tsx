
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-full text-gray-500"
        >
          <Plus size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="text-xs font-medium mb-1 text-gray-500">Add Tag</div>
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Add tags..."
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button 
            size="sm" 
            className="ml-2 h-8" 
            onClick={onTagAdd}
          >
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TagInputPopover;
