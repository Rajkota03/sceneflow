
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Save, X } from 'lucide-react';

export interface NoteEditorProps {
  note: Note | null;
  onSaveNote: (updatedNote: Note) => void;
  isPopup?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onSaveNote,
  isPopup = false,
  onClose,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  useEffect(() => {
    setIsValid(title.trim().length > 0);
  }, [title]);

  const handleSave = () => {
    if (!note || !isValid) return;

    onSaveNote({
      ...note,
      title,
      content,
      updatedAt: new Date().toISOString(),
    });
    
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  if (!note) return null;

  return (
    <div className={`flex flex-col ${isPopup ? 'h-full' : 'h-[calc(100vh-200px)]'} bg-white dark:bg-slate-900 rounded-md`}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-lg font-semibold w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 dark:text-white"
        />
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note content here..."
            className="min-h-[300px] w-full resize-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white"
          />
        </div>
      </ScrollArea>

      <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500">
          Last updated: {new Date(note.updatedAt || note.createdAt).toLocaleString()}
        </div>
        <div className="flex space-x-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            size="sm" 
            disabled={!isValid}
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
