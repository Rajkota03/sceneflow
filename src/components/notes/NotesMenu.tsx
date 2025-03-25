
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Note } from '@/lib/types';
import { FileText, Plus, Edit, Trash2, StickyNote, FlameKindling } from 'lucide-react';
import { BeatMode } from '@/types/scriptTypes';
import StructureSelector from '../act-bar/StructureSelector';

interface NotesMenuProps {
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

const NotesMenu: React.FC<NotesMenuProps> = ({ 
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-[#666666] hover:bg-[#DDDDDD] dark:text-slate-300 dark:hover:bg-slate-700 relative">
          <StickyNote size={18} className="mr-1" />
          <span className="text-xs">Notes</span>
          {notes.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {notes.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Notes & Structure</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Structure section */}
        {availableStructures && availableStructures.length > 0 && onStructureChange && (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Story Structure
            </DropdownMenuLabel>
            <div className="px-2 py-1.5">
              <StructureSelector 
                availableStructures={availableStructures}
                selectedStructureId={selectedStructureId}
                onStructureChange={onStructureChange}
              />
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Beat Mode Toggle */}
        {onToggleBeatMode && (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Beat Mode
            </DropdownMenuLabel>
            <div className="px-2 py-1.5 flex space-x-2">
              <Button 
                size="sm"
                variant={beatMode === 'on' ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => onToggleBeatMode('on')}
              >
                <FlameKindling size={14} className="mr-1" />
                On
              </Button>
              <Button 
                size="sm"
                variant={beatMode === 'off' ? 'default' : 'outline'} 
                className="h-7 text-xs"
                onClick={() => onToggleBeatMode('off')}
              >
                Off
              </Button>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Notes section */}
        <DropdownMenuLabel className="text-xs font-normal text-gray-500">
          Notes
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {notes.length === 0 ? (
            <div className="px-2 py-4 text-center text-gray-500 text-xs">
              No notes yet
            </div>
          ) : (
            notes.map(note => (
              <DropdownMenuItem key={note.id} className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 text-left justify-start" 
                  onClick={() => onOpenNote(note)}
                >
                  <FileText size={14} className="mr-2" />
                  <span className="truncate w-32">{note.title}</span>
                </Button>
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => onEditNote(note)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-red-500" 
                    onClick={() => onDeleteNote(note.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-center" 
            onClick={onCreateNote}
          >
            <Plus size={14} className="mr-2" />
            <span>New Note</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotesMenu;
