
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useThreeActStructure from '@/hooks/useThreeActStructure';
import useProjectTitle from '@/hooks/useProjectTitle';
import useStoryBeats from '@/hooks/useStoryBeats';
import StructureHeader from '@/components/structure/StructureHeader';
import StructureContent from '@/components/structure/StructureContent';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';
import { createDefaultStructure } from '@/lib/types';

const Structure = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive"
      });
      navigate('/sign-in');
      return;
    }
  }, [session, navigate]);
  
  // Core structure hook for managing the story structure
  const {
    structure,
    isLoading,
    isSaving,
    updateBeat,
    reorderBeats,
    saveStructure,
    initializeStructure
  } = useThreeActStructure(projectId || '');
  
  // Initialize default structure if none exists and we're not loading
  useEffect(() => {
    if (!isLoading && !structure && projectId && session) {
      console.log("Initializing default structure for project:", projectId);
      const defaultStructure = createDefaultStructure(projectId);
      initializeStructure(defaultStructure);
    }
  }, [isLoading, structure, projectId, session, initializeStructure]);
  
  // Project title management
  const {
    isUpdatingTitle,
    handleUpdateProjectTitle
  } = useProjectTitle(projectId, structure, saveStructure);
  
  // Story beats operations
  const { handleDeleteBeat } = useStoryBeats(structure, saveStructure);
  
  // Manual save handler
  const handleSaveStructure = () => {
    if (structure) {
      console.log("Manual save structure triggered");
      saveStructure(structure);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <StructureHeader 
        title={structure?.projectTitle || "Story Structure"} 
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
        onSave={handleSaveStructure}
      />
    </div>
  );
};

export default Structure;
