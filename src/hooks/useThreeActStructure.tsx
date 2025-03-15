
import { useState, useEffect } from 'react';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { ThreeActStructure, StoryBeat, createDefaultStructure } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export const useThreeActStructure = (projectId: string) => {
  const { session } = useAuth();
  const [structure, setStructure] = useState<ThreeActStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session || !projectId) return;
    
    const fetchStructure = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('structure')
          .eq('id', projectId)
          .eq('author_id', session.user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching structure:', error);
          toast({
            title: 'Error',
            description: 'Failed to load story structure',
            variant: 'destructive',
          });
          return;
        }
        
        let structureData: ThreeActStructure;
        
        if (!data?.structure) {
          structureData = createDefaultStructure(projectId);
        } else {
          structureData = data.structure as unknown as ThreeActStructure;
          
          // Ensure dates are Date objects
          structureData.createdAt = new Date(structureData.createdAt);
          structureData.updatedAt = new Date(structureData.updatedAt);
        }
        
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
    
    fetchStructure();
  }, [projectId, session]);

  const saveStructure = async (updatedStructure: ThreeActStructure) => {
    if (!session || !projectId) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          structure: updatedStructure,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('author_id', session.user.id);
      
      if (error) {
        console.error('Error saving structure:', error);
        toast({
          title: 'Error',
          description: 'Failed to save story structure',
          variant: 'destructive',
        });
        return;
      }
      
      setStructure(updatedStructure);
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
    
    const updatedBeats = structure.beats.map(beat => 
      beat.id === beatId ? { ...beat, ...updates } : beat
    );
    
    const updatedStructure = {
      ...structure,
      beats: updatedBeats,
      updatedAt: new Date()
    };
    
    saveStructure(updatedStructure);
  };

  const reorderBeats = (beats: StoryBeat[]) => {
    if (!structure) return;
    
    // Update positions based on new order
    const updatedBeats = beats.map((beat, index) => ({
      ...beat,
      position: index
    }));
    
    const updatedStructure = {
      ...structure,
      beats: updatedBeats,
      updatedAt: new Date()
    };
    
    saveStructure(updatedStructure);
  };

  return {
    structure,
    isLoading,
    isSaving,
    updateBeat,
    reorderBeats
  };
};

export default useThreeActStructure;
