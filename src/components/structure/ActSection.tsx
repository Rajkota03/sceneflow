
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
      case 1: return 'bg-[#D3E4FD]'; // Soft Blue
      case '2A': return 'bg-[#FEF7CD]'; // Soft Yellow
      case 'midpoint': return 'bg-[#FFCCCB]'; // Soft Red
      case '2B': return 'bg-[#FDE1D3]'; // Soft Orange/Peach
      case 3: return 'bg-[#F2FCE2]'; // Soft Green
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="mb-4">
      <div className={`${getActColor()} text-gray-800 px-4 py-2 rounded-t-md font-medium text-sm border border-gray-200`}>
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
