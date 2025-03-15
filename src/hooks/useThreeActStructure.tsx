
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

  const saveStructure = useCallback(async (updatedStructure: ThreeActStructure) => {
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
  }, [projectId, session]);

  const initializeStructure = useCallback(async (defaultStructure: ThreeActStructure) => {
    if (!session || !projectId) return;
    
    console.log("Initializing new structure:", defaultStructure.id);
    setIsSaving(true);
    
    try {
      // Make sure dates are proper Date objects before saving
      const preparedStructure = {
        ...defaultStructure,
        createdAt: defaultStructure.createdAt instanceof Date 
          ? defaultStructure.createdAt 
          : new Date(defaultStructure.createdAt),
        updatedAt: defaultStructure.updatedAt instanceof Date 
          ? defaultStructure.updatedAt 
          : new Date(defaultStructure.updatedAt)
      };
      
      await saveStructureData(preparedStructure, projectId, session.user.id);
      setStructure(preparedStructure);
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

  const updateBeat = useCallback((beatId: string, updates: Partial<StoryBeat>) => {
    if (!structure) return;
    console.log("Updating beat:", beatId, updates);
    
    const updatedStructure = createUpdatedStructureWithBeat(structure, beatId, updates);
    setStructure(updatedStructure);
    // Don't auto-save on direct input changes - this prevents saving on every keystroke
    // Auto-save will happen when the user blurs the field or clicks save
  }, [structure]);

  const saveUpdatedBeat = useCallback((beatId: string, updates: Partial<StoryBeat>) => {
    if (!structure) return;
    console.log("Saving beat update:", beatId, updates);
    
    const updatedStructure = createUpdatedStructureWithBeat(structure, beatId, updates);
    saveStructure(updatedStructure);
  }, [structure, saveStructure]);

  const reorderBeats = useCallback((beats: StoryBeat[]) => {
    if (!structure) return;
    console.log("Reordering beats");
    
    const updatedStructure = createUpdatedStructureWithReorderedBeats(structure, beats);
    setStructure(updatedStructure);
    // Auto-save on reordering - user expects drag and drop to persist
    saveStructure(updatedStructure);
  }, [structure, saveStructure]);

  return {
    structure,
    isLoading,
    isSaving,
    updateBeat,
    saveUpdatedBeat,
    reorderBeats,
    saveStructure,
    initializeStructure
  };
};

export default useThreeActStructure;
