
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
  onBeatClick?: (beat: StoryBeat) => void;
  taggingMode?: boolean;
}

const ActSection: React.FC<ActSectionProps> = ({
  actNumber,
  title,
  beats,
  onUpdateBeat,
  onDeleteBeat,
  onBeatClick,
  taggingMode = false
}) => {
  const getBgColor = () => {
    switch (actNumber) {
      case 1: return 'bg-[#D3E4FD]';
      case '2A': return 'bg-[#FEF7CD]';
      case 'midpoint': return 'bg-[#FFCCCB]';
      case '2B': return 'bg-[#FDE1D3]';
      case 3: return 'bg-[#F2FCE2]';
      default: return 'bg-gray-100';
    }
  };
  
  const getBorderColor = () => {
    switch (actNumber) {
      case 1: return 'border-[#4A90E2]';
      case '2A': return 'border-[#F5A623]';
      case 'midpoint': return 'border-[#FF9E9D]';
      case '2B': return 'border-[#F57C00]';
      case 3: return 'border-[#009688]';
      default: return 'border-gray-300';
    }
  };
  
  // Always render the section, even if there are no beats
  return (
    <div className="mb-8 relative z-10">
      <div className={`relative rounded-lg shadow-sm p-4 mx-8 ${getBgColor()} ${getBorderColor()} border`}>
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        
        {beats.length > 0 ? (
          <div className="space-y-3">
            {beats.map((beat) => (
              taggingMode ? (
                <div 
                  key={beat.id}
                  className="cursor-pointer transform transition hover:scale-105"
                  onClick={() => onBeatClick && onBeatClick(beat)}
                >
                  <StoryBeatItem 
                    beat={beat}
                    onUpdate={(updates) => onUpdateBeat(beat.id, updates)}
                    onDelete={onDeleteBeat ? () => onDeleteBeat(beat.id) : undefined}
                    readOnly={false}
                  />
                </div>
              ) : (
                <SortableItem key={beat.id} id={beat.id}>
                  <StoryBeatItem 
                    beat={beat}
                    onUpdate={(updates) => onUpdateBeat(beat.id, updates)}
                    onDelete={onDeleteBeat ? () => onDeleteBeat(beat.id) : undefined}
                  />
                </SortableItem>
              )
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500 italic text-sm">
            No beats in this act. Drag beats here or add new ones.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActSection;
