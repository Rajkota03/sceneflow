
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
        console.log("Fetching structure for project:", projectId);
        const { data, error } = await supabase
          .from('projects')
          .select('notes')
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
        
        // Check if there's a three-act structure in the notes
        let structureData: ThreeActStructure | null = null;
        
        if (data?.notes && Array.isArray(data.notes)) {
          console.log("Found notes array, looking for structure");
          // Look for a note that contains the structure data
          const structureNote = data.notes.find((note: any) => 
            note && typeof note === 'object' && note.id && note.id.startsWith('structure-')
          );
          
          if (structureNote) {
            console.log("Found structure note:", structureNote.id);
            structureData = structureNote as unknown as ThreeActStructure;
            // Ensure dates are Date objects
            structureData.createdAt = new Date(structureData.createdAt);
            structureData.updatedAt = new Date(structureData.updatedAt);
          }
        }
        
        // If no structure found, create a default one
        if (!structureData) {
          console.log("No structure found, creating default");
          structureData = createDefaultStructure(projectId);
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
      console.log("Saving structure:", updatedStructure.id);
      // First, get the current notes array
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('notes')
        .eq('id', projectId)
        .eq('author_id', session.user.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching notes:', fetchError);
        toast({
          title: 'Error',
          description: 'Failed to update story structure',
          variant: 'destructive',
        });
        return;
      }
      
      // Prepare the notes array
      let notes = Array.isArray(data?.notes) ? [...data.notes] : [];
      
      // Find if there's an existing structure note
      const structureIndex = notes.findIndex((note: any) => 
        note && typeof note === 'object' && note.id && note.id.startsWith('structure-')
      );
      
      // Fully serialize the structure data for storage in JSON format
      const structureForStorage = {
        id: updatedStructure.id,
        projectId: updatedStructure.projectId,
        createdAt: updatedStructure.createdAt instanceof Date 
          ? updatedStructure.createdAt.toISOString() 
          : updatedStructure.createdAt,
        updatedAt: new Date().toISOString(), // Always use current time for updates
        beats: updatedStructure.beats.map(beat => ({
          id: beat.id,
          title: beat.title,
          description: beat.description,
          position: beat.position,
          actNumber: beat.actNumber
        }))
      };
      
      // Update or add the structure note
      if (structureIndex >= 0) {
        notes[structureIndex] = structureForStorage;
      } else {
        notes.push(structureForStorage);
      }
      
      console.log("Updating project with structure");
      // Update the project with the new notes array
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('author_id', session.user.id);
      
      if (updateError) {
        console.error('Error saving structure:', updateError);
        toast({
          title: 'Error',
          description: 'Failed to save story structure',
          variant: 'destructive',
        });
        return;
      }
      
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
