
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act, Beat } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

const useProjectStructures = (projectId?: string) => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all structures and any linked structure for this project
  const fetchStructures = useCallback(async () => {
    if (!projectId) return;
    
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
            console.log("Set selected structure:", linkedStructure.name);
          }
        } else if (formattedStructures.length > 0) {
          // Default to the first structure if no link exists
          setSelectedStructureId(formattedStructures[0].id);
          setSelectedStructure(formattedStructures[0]);
          console.log("Set default structure:", formattedStructures[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching structures:', err);
      setError('Failed to load structures');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  // Initial fetch of structures
  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);
  
  // Handle structure change
  const handleStructureChange = useCallback((structureId: string) => {
    console.log("Structure ID changing to:", structureId);
    setSelectedStructureId(structureId);
    
    const structure = structures.find(s => s.id === structureId);
    if (structure) {
      console.log("Found structure:", structure.name);
      setSelectedStructure(structure);
      
      // Link the structure to the project in the database
      if (projectId) {
        linkStructureToProject(projectId, structureId);
      }
    } else {
      console.error("Could not find structure with ID:", structureId);
    }
  }, [structures, projectId]);
  
  // Function to link a structure to a project
  const linkStructureToProject = async (projectId: string, structureId: string) => {
    try {
      // First, delete any existing links
      await supabase
        .from('project_structures')
        .delete()
        .eq('project_id', projectId);
      
      // Then, create the new link
      const { error } = await supabase
        .from('project_structures')
        .insert({
          project_id: projectId,
          structure_id: structureId
        });
      
      if (error) {
        console.error("Error linking structure to project:", error);
        toast({
          title: "Error",
          description: "Failed to link structure to project",
          variant: "destructive"
        });
      } else {
        console.log("Successfully linked structure to project");
      }
    } catch (err) {
      console.error("Error in linkStructureToProject:", err);
    }
  };
  
  const updateBeatCompletion = (beatId: string, actId: string, complete: boolean) => {
    if (!selectedStructure) return null;
    
    const updatedStructure = { ...selectedStructure };
    
    const actIndex = updatedStructure.acts.findIndex(act => act.id === actId);
    if (actIndex === -1) return null;
    
    const beatIndex = updatedStructure.acts[actIndex].beats.findIndex(beat => beat.id === beatId);
    if (beatIndex === -1) return null;
    
    updatedStructure.acts[actIndex].beats[beatIndex].complete = complete;
    setSelectedStructure(updatedStructure);
    
    return updatedStructure;
  };
  
  const saveBeatCompletion = async (structureId: string, updatedStructure: Structure) => {
    if (!projectId) return false;
    
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
        await linkStructureToProject(projectId, structureId);
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
    saveBeatCompletion,
    fetchStructures
  };
};

export default useProjectStructures;
