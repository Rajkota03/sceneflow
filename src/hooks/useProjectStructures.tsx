
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

  const fetchStructures = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
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
            const acts = Array.isArray(s.acts) ? s.acts : (typeof s.acts === 'string' ? JSON.parse(s.acts) : []);
            
            parsedStructure = {
              id: s.id,
              name: s.name,
              description: s.description,
              structure_type: s.structure_type,
              created_at: s.created_at,
              updated_at: s.updated_at,
              acts: acts,
              createdAt: new Date(s.created_at).toISOString(),
              updatedAt: new Date(s.updated_at).toISOString(),
              author_id: s.author_id
            };
            
            return parsedStructure;
          } catch (parseError) {
            console.error('Error parsing structure data:', parseError);
            return {
              id: s.id,
              name: s.name,
              description: s.description || '',
              structure_type: s.structure_type || 'three_act',
              acts: [],
              createdAt: new Date(s.created_at).toISOString(),
              updatedAt: new Date(s.updated_at).toISOString(),
              author_id: s.author_id
            };
          }
        });
        
        setStructures(parsedStructures);
        
        if (projectStructure && !linkError) {
          const linkedStructureId = projectStructure.structure_id;
          setSelectedStructureId(linkedStructureId);
          
          const linkedStructure = parsedStructures.find(s => s.id === linkedStructureId);
          if (linkedStructure) {
            setSelectedStructure(linkedStructure);
          }
        } else if (parsedStructures.length > 0) {
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
    
    const newSelectedStructure = structures.find(s => s.id === structureId);
    if (!newSelectedStructure) {
      console.error('Structure not found:', structureId);
      return;
    }
    
    setSelectedStructureId(structureId);
    setSelectedStructure(newSelectedStructure);
    
    if (projectId) {
      try {
        await supabase
          .from('project_structures')
          .delete()
          .eq('project_id', projectId);
        
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

  const updateBeatCompletion = useCallback((beatId: string, actId: string, complete: boolean) => {
    if (!selectedStructure) {
      console.error('No structure selected');
      return null;
    }
    
    const updatedStructure = { ...selectedStructure };
    
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

  const saveBeatCompletion = useCallback(async (structureId: string, updatedStructure: Structure) => {
    if (!structureId) return false;
    
    try {
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
