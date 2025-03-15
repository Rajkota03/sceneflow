
import React from 'react';
import { StoryBeat } from '@/lib/types';
import StoryBeatItem from './StoryBeatItem';

interface ActSectionProps {
  actNumber: 1 | 2 | 3;
  title: string;
  beats: StoryBeat[];
  onUpdateBeat: (beatId: string, updates: Partial<StoryBeat>) => void;
}

const ActSection: React.FC<ActSectionProps> = ({ actNumber, title, beats, onUpdateBeat }) => {
  const getActColor = () => {
    switch (actNumber) {
      case 1: return 'bg-purple-700';
      case 2: return 'bg-blue-700';
      case 3: return 'bg-green-700';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="mb-8">
      <div className={`${getActColor()} text-white px-4 py-2 rounded-t-md font-medium text-sm`}>
        {title}
      </div>
      <div className="border border-t-0 rounded-b-md p-4 bg-white">
        {beats.map((beat) => (
          <StoryBeatItem 
            key={beat.id} 
            beat={beat} 
            onUpdate={onUpdateBeat} 
          />
        ))}
      </div>
    </div>
  );
};

export default ActSection;
