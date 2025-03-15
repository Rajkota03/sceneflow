
import { useState, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NotebookPen, ArrowLeft, Check } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import { Note } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface NotePopoverProps {
  initialNote?: Note;
  onSave: (note: Partial<Note>) => void;
  align?: 'center' | 'start' | 'end';
  sideOffset?: number;
  className?: string;
  triggerClassName?: string;
  buttonText?: string;
}

const NotePopover = ({ 
  initialNote, 
  onSave, 
  align = 'center',
  sideOffset = 4,
  className,
  triggerClassName,
  buttonText = 'Add Note'
}: NotePopoverProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setOpen(false);
    // If not editing an existing note, reset fields
    if (!initialNote) {
      setTitle('');
      setContent('');
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }

    onSave({
      id: initialNote?.id,
      title,
      content,
    });

    handleClose();
    toast({
      title: initialNote ? "Note updated" : "Note created",
      description: `"${title}" has been ${initialNote ? 'updated' : 'created'} successfully.`
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "flex items-center gap-2 transition-all hover:bg-accent", 
            triggerClassName
          )}
        >
          <NotebookPen size={16} />
          <span>{buttonText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        ref={contentRef} 
        className={cn("w-80 p-0", className)} 
        align={align} 
        sideOffset={sideOffset}
      >
        <div className="flex flex-col h-full">
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Note Title"
              className="w-full border-none bg-transparent text-sm font-medium outline-none focus:outline-none focus:ring-0"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus={!initialNote?.title}
            />
          </div>
          <Textarea
            placeholder="Add your note here..."
            className="flex-1 min-h-[150px] resize-none border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus={!!initialNote?.title}
          />
          <div className="flex justify-between items-center p-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose} 
              className="flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              <span>Cancel</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              className="flex items-center gap-1"
            >
              <Check size={16} />
              <span>{initialNote ? 'Update' : 'Save'}</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotePopover;
