
import React from 'react';
import { ThreeActStructure, StoryBeat, ActType } from '@/lib/types';
import ThreeActStructureTimeline from './ThreeActStructureTimeline';
import StructureToolsSidebar from './StructureToolsSidebar';
import { Loader } from 'lucide-react';

interface StructureContentProps {
  structure: ThreeActStructure | null;
  isLoading: boolean;
  isSaving: boolean;
  onUpdateBeat: (beatId: string, updates: Partial<StoryBeat>) => void;
  onReorderBeats: (beats: StoryBeat[]) => void;
  onUpdateProjectTitle: (title: string) => void;
  onDeleteBeat: (beatId: string) => void;
  onSave?: () => void;
}

const StructureContent: React.FC<StructureContentProps> = ({
  structure,
  isLoading,
  isSaving,
  onUpdateBeat,
  onReorderBeats,
  onUpdateProjectTitle,
  onDeleteBeat,
  onSave
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading structure...</p>
        </div>
      </div>
    );
  }

  // Make sure all acts are displayed in the timeline
  const allActTypes: ActType[] = [1, '2A', 'midpoint', '2B', 3];
  
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
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
};

export default StructureContent;
