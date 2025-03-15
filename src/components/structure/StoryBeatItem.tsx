
import React, { useState, useRef, useEffect } from 'react';
import { StoryBeat } from '@/lib/types';
import { Check, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface StoryBeatItemProps {
  beat: StoryBeat;
  onUpdate: (beatId: string, updates: Partial<StoryBeat>) => void;
}

const StoryBeatItem: React.FC<StoryBeatItemProps> = ({ beat, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(beat.title);
  const [description, setDescription] = useState(beat.description);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate(beat.id, { title, description });
    setIsEditing(false);
  };

  return (
    <div 
      className={`p-4 mb-4 border rounded-md shadow-sm ${
        beat.actNumber === 1
          ? 'border-l-4 border-l-purple-400 bg-purple-50'
          : beat.actNumber === 2
          ? 'border-l-4 border-l-blue-400 bg-blue-50'
          : 'border-l-4 border-l-green-400 bg-green-50'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-semibold text-sm"
          />
        ) : (
          <h3 className="font-semibold text-sm">{title}</h3>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="h-7 w-7 p-0"
        >
          {isEditing ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <Pencil size={16} className="text-gray-600" />
          )}
        </Button>
      </div>
      
      {isEditing ? (
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-xs leading-relaxed min-h-[80px]"
        />
      ) : (
        <p className="text-xs leading-relaxed text-gray-600">{description}</p>
      )}
    </div>
  );
};

export default StoryBeatItem;
