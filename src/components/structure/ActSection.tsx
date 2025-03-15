
import React from 'react';
import { StoryBeat, ActType } from '@/lib/types';
import StoryBeatItem from './StoryBeatItem';
import { SortableItem } from './SortableItem';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActSectionProps {
  actNumber: ActType;
  title: string;
  beats: StoryBeat[];
  onUpdateBeat: (beatId: string, updates: Partial<StoryBeat>) => void;
  onDeleteBeat?: (beatId: string) => void;
  onBeatClick?: (beat: StoryBeat) => void;
  onAddBeat?: (actNumber: ActType) => void;
  taggingMode?: boolean;
}

const ActSection: React.FC<ActSectionProps> = ({
  actNumber,
  title,
  beats,
  onUpdateBeat,
  onDeleteBeat,
  onBeatClick,
  onAddBeat,
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
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          
          {onAddBeat && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 p-0 text-gray-600 hover:text-gray-900"
              onClick={() => onAddBeat(actNumber)}
            >
              <PlusCircle size={16} />
              <span className="ml-1 text-xs">Add Beat</span>
            </Button>
          )}
        </div>
        
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
            {onAddBeat ? 
              "Add your first beat to this act" : 
              "No beats in this act. Drag beats here or add new ones."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActSection;
