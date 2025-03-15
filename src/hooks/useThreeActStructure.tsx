
import { useState, useEffect } from 'react';
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

  const updateBeat = (beatId: string, updates: Partial<StoryBeat>) => {
    if (!structure) return;
    
    const updatedStructure = createUpdatedStructureWithBeat(structure, beatId, updates);
    saveStructure(updatedStructure);
  };

  const reorderBeats = (beats: StoryBeat[]) => {
    if (!structure) return;
    
    const updatedStructure = createUpdatedStructureWithReorderedBeats(structure, beats);
    saveStructure(updatedStructure);
  };

  return {
    structure,
    isLoading,
    isSaving,
    updateBeat,
    reorderBeats,
    saveStructure
  };
};

export default useThreeActStructure;
