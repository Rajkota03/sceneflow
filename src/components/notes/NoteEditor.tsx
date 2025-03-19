
import React, { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X } from 'lucide-react';

export interface NoteEditorProps {
  note: Note;
  onSaveNote: (note: Note) => void;
  isPopup?: boolean;
  onClose?: () => void;
  onCancel?: () => void; // Add the missing property
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onSaveNote, 
  isPopup = false,
  onClose,
  onCancel // Include the new property in destructuring
}) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [isNoteSaved, setIsNoteSaved] = useState(true);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isNoteSaved) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isNoteSaved]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsNoteSaved(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsNoteSaved(false);
  };

  const handleSave = () => {
    const updatedNote = {
      ...note,
      title,
      content,
      lastModified: new Date()
    };
    onSaveNote(updatedNote);
    setIsNoteSaved(true);
    
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

  return (
    <div className={`flex flex-col ${isPopup ? 'bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 border border-slate-200 dark:border-slate-700' : 'h-full'}`}>
      <div className="flex justify-between items-center mb-4">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="text-lg font-medium border-none focus:ring-0 px-0 h-auto"
        />
        
        {isPopup && onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <Textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Write your note here..."
        className={`flex-grow resize-none border-none focus:ring-0 px-0 ${isPopup ? 'min-h-[200px]' : ''}`}
      />
      
      <div className="flex justify-end mt-4 space-x-2">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Note
        </Button>
      </div>
    </div>
  );
};

export default NoteEditor;
