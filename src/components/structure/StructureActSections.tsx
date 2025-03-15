
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StoryBeat, ActType } from '@/lib/types';
import ActSection from './ActSection';

interface StructureActSectionsProps {
  beats: StoryBeat[];
  actBeats: {
    act: ActType;
    beats: StoryBeat[];
  }[];
  onUpdateBeat: (beatId: string, updates: Partial<StoryBeat>) => void;
  onDeleteBeat?: (beatId: string) => void;
  onBeatClick: (beat: StoryBeat) => void;
  taggingMode?: boolean;
}

const StructureActSections: React.FC<StructureActSectionsProps> = ({
  beats,
  actBeats,
  onUpdateBeat,
  onDeleteBeat,
  onBeatClick,
  taggingMode = false
}) => {
  return (
    <SortableContext items={beats.map(beat => beat.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-4">
        {/* Act 1 */}
        <ActSection
          actNumber={1}
          title="Act 1 - Setup"
          beats={actBeats.find(item => item.act === 1)?.beats || []}
          onUpdateBeat={onUpdateBeat}
          onDeleteBeat={onDeleteBeat}
          onBeatClick={onBeatClick}
          taggingMode={taggingMode}
        />
        
        {/* Act 2A */}
        <ActSection
          actNumber="2A"
          title="Act 2A - Confrontation (First Half)"
          beats={actBeats.find(item => item.act === '2A')?.beats || []}
          onUpdateBeat={onUpdateBeat}
          onDeleteBeat={onDeleteBeat}
          onBeatClick={onBeatClick}
          taggingMode={taggingMode}
        />
        
        {/* Midpoint */}
        <ActSection
          actNumber="midpoint"
          title="Midpoint"
          beats={actBeats.find(item => item.act === 'midpoint')?.beats || []}
          onUpdateBeat={onUpdateBeat}
          onDeleteBeat={onDeleteBeat}
          onBeatClick={onBeatClick}
          taggingMode={taggingMode}
        />
        
        {/* Act 2B */}
        <ActSection
          actNumber="2B"
          title="Act 2B - Confrontation (Second Half)"
          beats={actBeats.find(item => item.act === '2B')?.beats || []}
          onUpdateBeat={onUpdateBeat}
          onDeleteBeat={onDeleteBeat}
          onBeatClick={onBeatClick}
          taggingMode={taggingMode}
        />
        
        {/* Act 3 */}
        <ActSection
          actNumber={3}
          title="Act 3 - Resolution"
          beats={actBeats.find(item => item.act === 3)?.beats || []}
          onUpdateBeat={onUpdateBeat}
          onDeleteBeat={onDeleteBeat}
          onBeatClick={onBeatClick}
          taggingMode={taggingMode}
        />
      </div>
    </SortableContext>
  );
};

export default StructureActSections;
