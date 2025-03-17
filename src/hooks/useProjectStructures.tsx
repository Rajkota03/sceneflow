
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act, Beat } from '@/lib/types';

const useProjectStructures = (projectId?: string) => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    
    const fetchStructures = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First check if the project has any linked structures
        const { data: linkData, error: linkError } = await supabase
          .from('project_structures')
          .select('structure_id')
          .eq('project_id', projectId);
        
        if (linkError) throw linkError;
        
        // Get all available structures
        const { data: structuresData, error: structuresError } = await supabase
          .from('structures')
          .select('*');
        
        if (structuresError) throw structuresError;
        
        if (structuresData) {
          // Convert timestamps to strings if needed
          const formattedStructures: Structure[] = structuresData.map(structureData => {
            // Parse the beats JSON field to get acts and beats
            let acts: Act[] = [];
            
            // Convert the structure data to our Structure type
            const structure: Structure = {
              id: structureData.id,
              name: structureData.name,
              description: structureData.description,
              createdAt: new Date(structureData.created_at).toISOString(),
              updatedAt: new Date(structureData.updated_at).toISOString(),
              structure_type: structureData.structure_type,
              acts: acts
            };
            
            try {
              if (typeof structureData.beats === 'string') {
                acts = JSON.parse(structureData.beats);
              } else if (structureData.beats && typeof structureData.beats === 'object') {
                acts = structureData.beats as unknown as Act[];
              }
              structure.acts = acts;
            } catch (e) {
              console.error('Error parsing beats:', e);
            }
            
            return structure;
          });
          
          setStructures(formattedStructures);
          
          // Set the selected structure if this project has a linked structure
          if (linkData && linkData.length > 0) {
            const linkedStructureId = linkData[0].structure_id;
            setSelectedStructureId(linkedStructureId);
            
            const linkedStructure = formattedStructures.find(s => s.id === linkedStructureId);
            if (linkedStructure) {
              setSelectedStructure(linkedStructure);
            }
          } else if (formattedStructures.length > 0) {
            // Default to the first structure if no link exists
            setSelectedStructureId(formattedStructures[0].id);
            setSelectedStructure(formattedStructures[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching structures:', err);
        setError('Failed to load structures');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStructures();
  }, [projectId]);
  
  const handleStructureChange = (structureId: string) => {
    setSelectedStructureId(structureId);
    const structure = structures.find(s => s.id === structureId) || null;
    setSelectedStructure(structure);
  };
  
  const updateBeatCompletion = (beatId: string, actId: string, complete: boolean) => {
    if (!selectedStructure) return;
    
    const updatedStructure = { ...selectedStructure };
    
    const actIndex = updatedStructure.acts.findIndex(act => act.id === actId);
    if (actIndex === -1) return;
    
    const beatIndex = updatedStructure.acts[actIndex].beats.findIndex(beat => beat.id === beatId);
    if (beatIndex === -1) return;
    
    updatedStructure.acts[actIndex].beats[beatIndex].complete = complete;
    setSelectedStructure(updatedStructure);
    
    return updatedStructure;
  };
  
  const saveBeatCompletion = async (structureId: string, updatedStructure: Structure) => {
    if (!projectId) return;
    
    try {
      // First, ensure there's a link between the project and structure
      const { data: linkData, error: linkError } = await supabase
        .from('project_structures')
        .select('*')
        .eq('project_id', projectId)
        .eq('structure_id', structureId);
      
      if (linkError) throw linkError;
      
      if (!linkData || linkData.length === 0) {
        // Create the link if it doesn't exist
        const { error: insertError } = await supabase
          .from('project_structures')
          .insert({ 
            project_id: projectId, 
            structure_id: structureId 
          });
        
        if (insertError) throw insertError;
      }
      
      // Update the structure in the database
      const { error: updateError } = await supabase
        .from('structures')
        .update({ 
          beats: updatedStructure.acts, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', structureId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setStructures(structures.map(s => 
        s.id === structureId ? updatedStructure : s
      ));
      
      return true;
    } catch (err) {
      console.error('Error saving beat completion:', err);
      return false;
    }
  };

  return {
    structures,
    selectedStructureId,
    selectedStructure,
    isLoading,
    error,
    handleStructureChange,
    updateBeatCompletion,
    saveBeatCompletion
  };
};

export default useProjectStructures;
