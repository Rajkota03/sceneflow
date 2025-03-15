
import React from 'react';
import { StoryBeat, ActType } from '@/lib/types';
import StoryBeatItem from './StoryBeatItem';
import { SortableItem } from './SortableItem';

interface ActSectionProps {
  actNumber: ActType;
  title: string;
  beats: StoryBeat[];
  onUpdateBeat: (beatId: string, updates: Partial<StoryBeat>) => void;
  onDeleteBeat?: (beatId: string) => void;
}

const ActSection: React.FC<ActSectionProps> = ({ actNumber, title, beats, onUpdateBeat, onDeleteBeat }) => {
  const getActColor = () => {
    switch (actNumber) {
      case 1: return 'bg-[#4A90E2]'; // Soft Blue
      case '2A': return 'bg-[#F5A623]'; // Golden Yellow
      case 'midpoint': return 'bg-[#D0021B]'; // Bold Red
      case '2B': return 'bg-[#F57C00]'; // Deep Orange
      case 3: return 'bg-[#009688]'; // Strong Green
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="mb-4">
      <div className={`${getActColor()} text-white px-4 py-2 rounded-t-md font-medium text-sm`}>
        {title}
      </div>
      <div className="border border-t-0 rounded-b-md p-4 bg-white">
        {beats.map((beat) => (
          <SortableItem key={beat.id} id={beat.id}>
            <StoryBeatItem 
              beat={beat} 
              onUpdate={onUpdateBeat}
              onDelete={onDeleteBeat ? () => onDeleteBeat(beat.id) : undefined}
            />
          </SortableItem>
        ))}
      </div>
    </div>
  );
};

export default ActSection;
