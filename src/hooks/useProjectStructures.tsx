
import { useState, useEffect, useCallback } from 'react';
import { Structure, Act, Beat } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  createThreeActStructure, 
  createSaveTheCatStructure, 
  createHeroJourneyStructure, 
  createStoryCircleStructure 
} from '@/lib/structureTemplates';

const useProjectStructures = (projectId?: string) => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Define fetchStructures function that was missing
  const fetchStructures = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      // Fetch all structures and get the linked structure for this project
      const { data: allStructures, error: structuresError } = await supabase
        .from('structures')
        .select('*');
      
      if (structuresError) {
        console.error('Error fetching structures:', structuresError);
        setError(structuresError.message);
        return;
      }
      
      const { data: projectStructure, error: linkError } = await supabase
        .from('project_structures')
        .select('structure_id')
        .eq('project_id', projectId)
        .single();
      
      if (allStructures) {
        const parsedStructures: Structure[] = allStructures.map((s: any) => {
          let parsedStructure: Structure;
          try {
            // Parse JSON fields if they're stored as strings
            const acts = Array.isArray(s.acts) ? s.acts : (typeof s.acts === 'string' ? JSON.parse(s.acts) : []);
            
            parsedStructure = {
              id: s.id,
              name: s.name,
              description: s.description,
              structure_type: s.structure_type,
              author_id: s.author_id,
              created_at: s.created_at,
              updated_at: s.updated_at,
              acts: acts
            };
            
            return parsedStructure;
          } catch (parseError) {
            console.error('Error parsing structure data:', parseError);
            return {
              id: s.id,
              name: s.name,
              description: s.description || '',
              structure_type: s.structure_type || 'three_act',
              author_id: s.author_id,
              created_at: s.created_at,
              updated_at: s.updated_at,
              acts: []
            };
          }
        });
        
        setStructures(parsedStructures);
        
        // Set the linked structure as selected if it exists
        if (projectStructure && !linkError) {
          const linkedStructureId = projectStructure.structure_id;
          setSelectedStructureId(linkedStructureId);
          
          const linkedStructure = parsedStructures.find(s => s.id === linkedStructureId);
          if (linkedStructure) {
            setSelectedStructure(linkedStructure);
          }
        } else if (parsedStructures.length > 0) {
          // Default to first structure if no link exists
          setSelectedStructureId(parsedStructures[0].id);
          setSelectedStructure(parsedStructures[0]);
        }
      }
    } catch (error) {
      console.error('Error in fetchStructures:', error);
      setError('Failed to fetch structures');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const handleStructureChange = useCallback(async (structureId: string) => {
    console.log("Changing structure to:", structureId);
    
    // Find the structure in the list
    const newSelectedStructure = structures.find(s => s.id === structureId);
    if (!newSelectedStructure) {
      console.error('Structure not found:', structureId);
      return;
    }
    
    setSelectedStructureId(structureId);
    setSelectedStructure(newSelectedStructure);
    
    // Update the project-structure link if we have a project ID
    if (projectId) {
      try {
        // First delete any existing links
        await supabase
          .from('project_structures')
          .delete()
          .eq('project_id', projectId);
        
        // Then create a new link
        const { error } = await supabase
          .from('project_structures')
          .insert({
            project_id: projectId,
            structure_id: structureId
          });
        
        if (error) {
          console.error('Error linking structure to project:', error);
          toast({
            title: 'Error',
            description: 'Failed to link structure to project',
            variant: 'destructive'
          });
        } else {
          console.log('Structure linked to project successfully');
        }
      } catch (error) {
        console.error('Error in handleStructureChange:', error);
      }
    }
  }, [projectId, structures]);

  // Function to update a beat's completion status
  const updateBeatCompletion = useCallback((beatId: string, actId: string, complete: boolean) => {
    if (!selectedStructure) {
      console.error('No structure selected');
      return null;
    }
    
    const updatedStructure = { ...selectedStructure };
    
    // Make sure acts is always an array
    if (!Array.isArray(updatedStructure.acts)) {
      console.error('Structure acts is not an array:', updatedStructure.acts);
      updatedStructure.acts = [];
      return updatedStructure;
    }
    
    const actIndex = updatedStructure.acts.findIndex(act => act.id === actId);
    if (actIndex === -1) {
      console.error('Act not found:', actId);
      return updatedStructure;
    }
    
    const act = updatedStructure.acts[actIndex];
    
    // Make sure beats is always an array
    if (!Array.isArray(act.beats)) {
      console.error('Act beats is not an array:', act.beats);
      act.beats = [];
      return updatedStructure;
    }
    
    const beatIndex = act.beats.findIndex(beat => beat.id === beatId);
    if (beatIndex === -1) {
      console.error('Beat not found:', beatId);
      return updatedStructure;
    }
    
    act.beats[beatIndex].complete = complete;
    return updatedStructure;
  }, [selectedStructure]);

  // Function to save the updated structure to the database
  const saveBeatCompletion = useCallback(async (structureId: string, updatedStructure: Structure) => {
    if (!structureId) return false;
    
    try {
      // Extract just the acts from the structure for the update
      const acts = updatedStructure.acts;
      
      const { error } = await supabase
        .from('structures')
        .update({ 
          acts,
          updated_at: new Date().toISOString()
        })
        .eq('id', structureId);
      
      if (error) {
        console.error('Error updating structure:', error);
        return false;
      }
      
      setSelectedStructure(updatedStructure);
      return true;
    } catch (error) {
      console.error('Error in saveBeatCompletion:', error);
      return false;
    }
  }, []);

  return {
    structures,
    selectedStructureId,
    selectedStructure,
    isLoading,
    error,
    handleStructureChange,
    updateBeatCompletion,
    saveBeatCompletion,
    fetchStructures
  };
};

export default useProjectStructures;
