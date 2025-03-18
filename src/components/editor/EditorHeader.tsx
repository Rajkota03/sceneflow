
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronDown, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NotesMenu from '@/components/notes/NotesMenu';
import { Note } from '@/lib/types';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving: boolean;
  saveButtonText: string;
  saveButtonIcon: "save" | "saved";
  onSave: () => void;
  notes: Note[];
  onOpenNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  isSaving,
  saveButtonText,
  saveButtonIcon,
  onSave,
  notes,
  onOpenNote,
  onCreateNote,
  onDeleteNote,
  onEditNote
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F1F1F1] border-b border-[#DDDDDD] py-1 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-[#333333] hover:bg-[#DDDDDD]" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border border-[#DDDDDD]">
          <FileText size={16} className="text-[#666666]" />
          <Input 
            type="text" 
            value={title} 
            onChange={onTitleChange} 
            className="w-48 font-medium border-none h-6 focus-visible:ring-0 p-0 text-[#333333] text-sm" 
            placeholder="Untitled Screenplay" 
          />
          <ChevronDown size={16} className="text-[#666666]" />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <NotesMenu 
          notes={notes}
          onOpenNote={onOpenNote}
          onCreateNote={onCreateNote}
          onDeleteNote={onDeleteNote}
          onEditNote={onEditNote}
        />
        
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="bg-[#0FA0CE] hover:bg-[#0D8CAF] text-white min-w-[70px]"
        >
          {isSaving ? (
            <div className="animate-spin mr-1 h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
          ) : saveButtonIcon === "save" ? (
            <Save size={16} className="mr-1" />
          ) : (
            <Check size={16} className="mr-1" />
          )}
          <span className="text-xs">{saveButtonText}</span>
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
