
import React from 'react';
import { ThreeActStructure, StoryBeat } from '@/lib/types';
import ThreeActStructureTimeline from './ThreeActStructureTimeline';
import StructureToolsSidebar from './StructureToolsSidebar';

interface StructureContentProps {
  structure: ThreeActStructure | null;
  isLoading: boolean;
  isSaving: boolean;
  onUpdateBeat: (beatId: string, updates: Partial<StoryBeat>) => void;
  onReorderBeats: (beats: StoryBeat[]) => void;
  onUpdateProjectTitle: (title: string) => void;
  onDeleteBeat: (beatId: string) => void;
}

const StructureContent: React.FC<StructureContentProps> = ({
  structure,
  isLoading,
  isSaving,
  onUpdateBeat,
  onReorderBeats,
  onUpdateProjectTitle,
  onDeleteBeat
}) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <StructureToolsSidebar />
        
        <div className="flex-1">
          <ThreeActStructureTimeline 
            structure={structure}
            isLoading={isLoading}
            isSaving={isSaving}
            onUpdateBeat={onUpdateBeat}
            onReorderBeats={onReorderBeats}
            onUpdateProjectTitle={onUpdateProjectTitle}
            onDeleteBeat={onDeleteBeat}
          />
        </div>
      </div>
    </div>
  );
};

export default StructureContent;
