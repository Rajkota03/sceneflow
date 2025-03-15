
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/App';
import { ThreeActStructure, StoryBeat } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { fetchStructureData, saveStructureData } from '@/services/structureService';
import { createUpdatedStructureWithBeat, createUpdatedStructureWithReorderedBeats } from './structureUtils';

export const useThreeActStructure = (projectId: string) => {
  const { session } = useAuth();
  const [structure, setStructure] = useState<ThreeActStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session || !projectId) return;
    
    const loadStructure = async () => {
      setIsLoading(true);
      
      try {
        const structureData = await fetchStructureData(projectId, session.user.id);
        console.log("Loaded structure data:", structureData?.id);
        setStructure(structureData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load story structure',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStructure();
  }, [projectId, session]);

  const saveStructure = async (updatedStructure: ThreeActStructure) => {
    if (!session || !projectId || !updatedStructure) return;
    
    setIsSaving(true);
    console.log("Saving structure:", updatedStructure.id);
    
    try {
      await saveStructureData(updatedStructure, projectId, session.user.id);
      setStructure(updatedStructure);
      toast({
        title: 'Success',
        description: 'Story structure saved successfully',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save story structure',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const initializeStructure = useCallback(async (defaultStructure: ThreeActStructure) => {
    if (!session || !projectId) return;
    
    setIsSaving(true);
    console.log("Initializing new structure:", defaultStructure.id);
    
    try {
      await saveStructureData(defaultStructure, projectId, session.user.id);
      setStructure(defaultStructure);
      toast({
        title: 'Structure Created',
        description: 'New story structure initialized successfully',
      });
    } catch (error) {
      console.error('Error initializing structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to create story structure',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, session]);

  const updateBeat = (beatId: string, updates: Partial<StoryBeat>) => {
    if (!structure) return;
    console.log("Updating beat:", beatId, updates);
    
    const updatedStructure = createUpdatedStructureWithBeat(structure, beatId, updates);
    // Don't auto-save for now, let user save manually
    setStructure(updatedStructure);
  };

  const reorderBeats = (beats: StoryBeat[]) => {
    if (!structure) return;
    console.log("Reordering beats");
    
    const updatedStructure = createUpdatedStructureWithReorderedBeats(structure, beats);
    // Don't auto-save for now, let user save manually
    setStructure(updatedStructure);
  };

  return {
    structure,
    isLoading,
    isSaving,
    updateBeat,
    reorderBeats,
    saveStructure,
    initializeStructure
  };
};

export default useThreeActStructure;
