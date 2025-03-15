
import React, { useState } from 'react';
import { StoryBeat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, X, Save, Bookmark } from 'lucide-react';

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
  const [title, setTitle] = useState(beat.title);
  const [description, setDescription] = useState(beat.description);
  
  const handleSave = () => {
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
    onUpdate({ title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    onUpdate({ description: e.target.value });
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
    <div className={`p-3 rounded-md shadow-sm border-l-4 ${getActColor()} bg-white`}>
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-medium"
            placeholder="Beat title"
          />
          
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-sm"
            placeholder="Beat description"
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
            <div className="flex items-center">
              <Bookmark size={14} className="mr-1.5 flex-shrink-0" />
              <Input
                value={title}
                onChange={handleTitleChange}
                className="border-0 p-0 h-auto font-medium text-sm bg-transparent focus-visible:ring-0"
                placeholder="Enter beat title"
              />
            </div>
            
            {!readOnly && (
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit size={12} />
                </Button>
                
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={onDelete}
                  >
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            className="text-xs text-gray-600 mt-1 pl-5 border-0 resize-none bg-transparent p-0 focus-visible:ring-0 min-h-[20px]"
            placeholder="Enter beat description"
          />
        </>
      )}
    </div>
  );
};

export default StoryBeatItem;
