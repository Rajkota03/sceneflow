
import React, { useState } from 'react';
import { Act, Beat } from '@/lib/models/structureModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, GripVertical, MessageSquare, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface BeatItemProps {
  act: Act;
  beat: Beat;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave?: (updatedBeat: Beat) => void;
}

export const BeatItem: React.FC<BeatItemProps> = ({
  act,
  beat,
  isEditing,
  onEdit,
  onDelete,
  onSave
}) => {
  const [editedBeat, setEditedBeat] = useState<Beat>({ ...beat });
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  
  const handleSave = () => {
    if (onSave) {
      onSave(editedBeat);
    }
  };
  
  const toggleNotes = () => {
    setIsNotesExpanded(!isNotesExpanded);
  };
  
  // Convert percentage to estimated page count (assuming 1% = 1.2 pages in a 120-page screenplay)
  const getEstimatedPageCount = (percentage: number) => {
    return Math.round((percentage / 100) * 120);
  };
  
  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors group">
        <div className="space-y-4">
          <div>
            <label htmlFor="beat-title" className="block text-sm font-medium text-slate-700 mb-1">
              Beat Title
            </label>
            <Input 
              id="beat-title"
              value={editedBeat.title} 
              onChange={(e) => setEditedBeat({
                ...editedBeat,
                title: e.target.value
              })} 
              className="border-slate-200"
            />
          </div>
          <div>
            <label htmlFor="beat-description" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <Textarea 
              id="beat-description"
              value={editedBeat.description} 
              onChange={(e) => setEditedBeat({
                ...editedBeat,
                description: e.target.value
              })} 
              rows={3}
              className="border-slate-200 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate a specific background color based on the act color for a softer look
  const getBeatBackground = () => {
    // Add some transparency to the act color for a more subtle effect
    const hexColor = act.colorHex;
    return `${hexColor}15`; // 15 is hex for ~8% opacity
  };
  
  const hasNotes = beat.description && beat.description.trim() !== '';
  const pageCount = getEstimatedPageCount(beat.timePosition);
  
  return (
    <div 
      className="border rounded-lg mb-2 bg-white hover:bg-slate-50 transition-colors group overflow-hidden"
      style={{ borderLeft: `3px solid ${act.colorHex}` }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between group">
          <div className="flex items-center flex-1">
            <GripVertical className="h-5 w-5 text-slate-400 mr-3 cursor-move opacity-50 group-hover:opacity-100" />
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <h4 className="font-medium text-slate-800">{beat.title}</h4>
                <span 
                  className="ml-2 text-xs px-2 py-1 rounded-full text-slate-700 flex items-center"
                  style={{ backgroundColor: getBeatBackground() }}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Page {pageCount}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {hasNotes && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                onClick={toggleNotes}
              >
                {isNotesExpanded ? 
                  <ChevronUp className="h-4 w-4 text-slate-600" /> : 
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                }
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4 text-slate-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        
        {/* Collapsible notes section */}
        {hasNotes && isNotesExpanded && (
          <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
            <div className="flex items-start">
              <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 mr-2" />
              <p className="text-sm text-slate-600">{beat.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
