
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronDown, Save, Check, Download } from 'lucide-react'; // Added Download icon
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NotesMenu from '@/components/notes/NotesMenu';
import { Note } from '@/lib/types';
import ThemeToggleButton from './ThemeToggleButton';
import { BeatMode } from '@/types/scriptTypes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added DropdownMenu components

interface EditorHeaderProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving: boolean;
  saveButtonText: string;
  saveButtonIcon: "save" | "saved";
  onSave: () => void;
  onExportPdf: () => void; // Added prop for PDF export handler
  notes: Note[];
  onOpenNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  availableStructures?: Array<{ id: string; name: string }>;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  isSaving,
  saveButtonText,
  saveButtonIcon,
  onSave,
  onExportPdf, // Destructure the new prop
  notes,
  onOpenNote,
  onCreateNote,
  onDeleteNote,
  onEditNote,
  availableStructures,
  selectedStructureId,
  onStructureChange,
  beatMode = 'on',
  onToggleBeatMode
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F1F1F1] dark:bg-slate-800 border-b border-[#DDDDDD] dark:border-slate-700 py-1 px-4 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center space-x-4">
        {/* Back Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#333333] dark:text-slate-200 hover:bg-[#DDDDDD] dark:hover:bg-slate-700" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Title Input Area */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-[#DDDDDD] dark:border-slate-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-600">
              <FileText size={16} className="text-[#666666] dark:text-slate-300" />
              <Input 
                type="text" 
                value={title} 
                onChange={onTitleChange} 
                className="w-48 font-medium border-none h-6 focus-visible:ring-0 p-0 text-[#333333] dark:text-slate-200 text-sm bg-transparent pointer-events-none" // Prevent direct input focus, use dropdown
                placeholder="Untitled Screenplay" 
                readOnly // Make input read-only, edit via dropdown if needed later
              />
              <ChevronDown size={16} className="text-[#666666] dark:text-slate-300" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {/* Add rename/save as options here later if needed */}
            <DropdownMenuItem onClick={onExportPdf}> {/* Export PDF Option */}
              <Download className="mr-2 h-4 w-4" />
              <span>Export as PDF</span>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>Save As...</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Right Side Controls */}
      <div className="flex items-center space-x-2">
        <ThemeToggleButton />
        
        <NotesMenu 
          notes={notes}
          onOpenNote={onOpenNote}
          onCreateNote={onCreateNote}
          onDeleteNote={onDeleteNote}
          onEditNote={onEditNote}
          availableStructures={availableStructures}
          selectedStructureId={selectedStructureId}
          onStructureChange={onStructureChange}
          beatMode={beatMode}
          onToggleBeatMode={onToggleBeatMode}
        />
        
        {/* Save Button */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="bg-[#0FA0CE] hover:bg-[#0D8CAF] text-white min-w-[70px] dark:bg-indigo-600 dark:hover:bg-indigo-700"
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

