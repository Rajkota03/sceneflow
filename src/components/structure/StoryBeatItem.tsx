
import React, { useState, useEffect } from 'react';
import { StoryBeat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, X, Save, Bookmark, PencilLine } from 'lucide-react';

interface StoryBeatItemProps {
  beat: StoryBeat;
  onUpdate: (updates: Partial<StoryBeat>) => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

const StoryBeatItem: React.FC<StoryBeatItemProps> = ({ 
  beat, 
  onUpdate, 
  onDelete,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [title, setTitle] = useState(beat.title);
  const [description, setDescription] = useState(beat.description);
  
  // Update local state when beat props change
  useEffect(() => {
    setTitle(beat.title);
    setDescription(beat.description);
  }, [beat.title, beat.description]);
  
  const handleSave = () => {
    console.log('Saving beat with updates:', { title, description }); // Add detailed logging
    onUpdate({ title, description });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setTitle(beat.title);
    setDescription(beat.description);
    setIsEditing(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const getActColor = () => {
    switch (beat.actNumber) {
      case 1: return 'border-[#4A90E2] bg-[#EAF2FD] text-[#2171D2]';
      case '2A': return 'border-[#F5A623] bg-[#FEF9E7] text-[#D28A21]';
      case 'midpoint': return 'border-[#FF9E9D] bg-[#FFF0F0] text-[#D24E4D]';
      case '2B': return 'border-[#F57C00] bg-[#FFF4EC] text-[#D26600]';
      case 3: return 'border-[#009688] bg-[#F4FCF9] text-[#007F73]';
      default: return 'border-gray-300 bg-white text-gray-600';
    }
  };
  
  return (
    <div 
      className={`p-3 rounded-md shadow-sm border-l-4 ${getActColor()} bg-white transition-all hover:shadow-md`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={title}
            onChange={handleTitleChange}
            className="font-medium"
            placeholder="Beat title"
            autoFocus
          />
          
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            className="text-sm min-h-[80px]"
            placeholder="Enter your story details for this beat..."
            rows={3}
          />
          
          <div className="flex justify-end space-x-2 pt-1">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X size={14} className="mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save size={14} className="mr-1" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div 
              className="flex items-center flex-1 cursor-pointer"
              onClick={() => !readOnly && setIsEditing(true)}
            >
              <Bookmark size={14} className="mr-1.5 flex-shrink-0" />
              <div className="flex-1 font-medium text-sm">
                {title || "Enter beat title"}
              </div>
            </div>
            
            {!readOnly && (
              <div className="flex space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit size={12} />
                </Button>
              </div>
            )}
          </div>
          
          <div 
            className="relative mt-1 pl-5 cursor-pointer"
            onClick={() => !readOnly && setIsEditing(true)}
          >
            {description ? (
              <p className="text-xs text-gray-600 whitespace-pre-line">
                {description}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Click to add your story details for this beat...
              </p>
            )}
            
            {isHovered && !readOnly && !isEditing && (
              <div className="absolute right-0 bottom-0 bg-white bg-opacity-70 p-1 rounded-full">
                <PencilLine size={12} className="text-gray-500" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StoryBeatItem;
