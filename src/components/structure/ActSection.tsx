import React from 'react';
import { StoryBeat, ActType } from '@/lib/types';
import StoryBeatItem from './StoryBeatItem';
import { SortableItem } from './SortableItem';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const getActInfo = () => {
    switch (actNumber) {
      case 1: 
        return "Setup (0%-25%): Introduce the world, characters, and establish the problem";
      case '2A': 
        return "Reaction Phase (25%-50%): Character begins journey, faces initial obstacles";
      case 'midpoint': 
        return "Major turning point where the protagonist shifts from reactive to proactive";
      case '2B': 
        return "Action Phase (50%-75%): Character takes initiative, faces increasing obstacles";
      case 3: 
        return "Climax & Resolution (75%-100%): Final confrontation and wrap-up";
      default: 
        return "";
    }
  };
  
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
  
  return (
    <div className="mb-4 relative">
      <div className={`relative rounded-lg shadow-sm p-4 ${getBgColor()} ${getBorderColor()} border`}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Info size={14} className="text-gray-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{getActInfo()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                    readOnly={false}
                  />
                </SortableItem>
              )
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500 italic text-sm">
            No beats in this act.
          </div>
        )}
      </div>
      
      {/* Connector line to next section */}
      {actNumber !== 3 && (
        <div className="absolute left-1/2 -translate-x-1/2 h-4 w-0.5 bg-gray-300 bottom-0 transform translate-y-full"></div>
      )}
    </div>
  );
};

export default ActSection;
