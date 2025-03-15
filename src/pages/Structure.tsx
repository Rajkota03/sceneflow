
import React from 'react';
import { useParams } from 'react-router-dom';
import useThreeActStructure from '@/hooks/useThreeActStructure';
import useProjectTitle from '@/hooks/useProjectTitle';
import useStoryBeats from '@/hooks/useStoryBeats';
import StructureHeader from '@/components/structure/StructureHeader';
import StructureContent from '@/components/structure/StructureContent';

const Structure = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // Core structure hook for managing the story structure
  const {
    structure,
    isLoading,
    isSaving,
    updateBeat,
    reorderBeats,
    saveStructure
  } = useThreeActStructure(projectId || '');
  
  // Project title management
  const {
    isUpdatingTitle,
    handleUpdateProjectTitle
  } = useProjectTitle(projectId, structure, saveStructure);
  
  // Story beats operations
  const { handleDeleteBeat } = useStoryBeats(structure, saveStructure);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <StructureHeader 
        title="Story Structure" 
        projectId={projectId} 
      />
      
      <StructureContent 
        structure={structure}
        isLoading={isLoading}
        isSaving={isSaving || isUpdatingTitle}
        onUpdateBeat={updateBeat}
        onReorderBeats={reorderBeats}
        onUpdateProjectTitle={handleUpdateProjectTitle}
        onDeleteBeat={handleDeleteBeat}
      />
    </div>
  );
};

export default Structure;
