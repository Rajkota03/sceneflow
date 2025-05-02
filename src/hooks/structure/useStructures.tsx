
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act, Beat } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

interface UseStructuresProps {
  projectId?: string;
}

export function useStructures({ projectId }: UseStructuresProps) {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all available structures
  const fetchStructures = useCallback(async () => {
    console.log("Fetching all available structures...");
    setIsLoading(true);
    try {
      const { data: structuresData, error: structuresError } = await supabase
        .from('structures')
        .select('*');

      if (structuresError) throw structuresError;

      if (structuresData) {
        const formattedStructures: Structure[] = structuresData.map(structureData => {
          let acts: Act[] = [];
          try {
            // Handle both stringified JSON and actual JSON object/array
            if (typeof structureData.beats === 'string') {
              acts = JSON.parse(structureData.beats);
            } else if (structureData.beats && typeof structureData.beats === 'object') {
              // Ensure it's treated as an array, even if stored as an object in Supabase
              acts = Array.isArray(structureData.beats) ? structureData.beats : Object.values(structureData.beats);
            }
          } catch (e) {
            console.error(`Error parsing acts/beats for structure ${structureData.id}:`, e);
            acts = []; // Default to empty array on error
          }

          return {
            id: structureData.id,
            name: structureData.name,
            description: structureData.description,
            createdAt: new Date(structureData.created_at).toISOString(),
            updatedAt: new Date(structureData.updated_at).toISOString(),
            structure_type: structureData.structure_type,
            acts: acts
          };
        });
        console.log(`Fetched ${formattedStructures.length} structures.`);
        setStructures(formattedStructures);
        return formattedStructures; // Return fetched structures
      }
      return []; // Return empty if no data
    } catch (error) {
      console.error('Error fetching structures:', error);
      toast({ title: "Error", description: "Failed to load structures.", variant: "destructive" });
      return []; // Return empty on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch the structure linked to the current project
  const fetchLinkedStructure = useCallback(async (availableStructures: Structure[]) => {
    if (!projectId || availableStructures.length === 0) {
        console.log("Cannot fetch linked structure: Project ID or available structures missing.");
        // If no project ID, maybe default to the first available structure?
        if(availableStructures.length > 0) {
            setSelectedStructureId(availableStructures[0].id);
        }
        return;
    }
    console.log(`Fetching linked structure for project ${projectId}...`);
    try {
      const { data: linkData, error: linkError } = await supabase
        .from('project_structures')
        .select('structure_id')
        .eq('project_id', projectId)
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 result

      if (linkError) throw linkError;

      let linkedId: string | null = null;
      if (linkData) {
        linkedId = linkData.structure_id;
        console.log(`Project ${projectId} is linked to structure ${linkedId}.`);
      } else {
        // If no link exists, default to the first available structure
        linkedId = availableStructures[0]?.id || null;
        console.log(`No structure linked for project ${projectId}. Defaulting to ${linkedId}.`);
        // Optionally, create the link row here if defaulting
        if (linkedId) {
            // linkStructureToProject(linkedId); // Call linking function
        }
      }
      setSelectedStructureId(linkedId);

    } catch (error) {
      console.error('Error fetching linked structure:', error);
      // Fallback to first available structure on error?
      setSelectedStructureId(availableStructures[0]?.id || null);
    }
  }, [projectId]);

  // Link a structure to the project
  const linkStructureToProject = useCallback(async (structureId: string) => {
    if (!projectId) return false;
    console.log(`Linking structure ${structureId} to project ${projectId}...`);
    try {
      // Remove existing links first (optional, depends on desired behavior)
      await supabase
        .from('project_structures')
        .delete()
        .eq('project_id', projectId);

      // Insert the new link
      const { error } = await supabase
        .from('project_structures')
        .insert({ project_id: projectId, structure_id: structureId });

      if (error) throw error;
      console.log(`Successfully linked structure ${structureId} to project ${projectId}.`);
      return true;
    } catch (error) {
      console.error('Error linking structure:', error);
      toast({ title: "Error", description: "Failed to link structure to project.", variant: "destructive" });
      return false;
    }
  }, [projectId]);

  // Update the structure definition (e.g., reordered acts/beats)
  const updateStructure = useCallback(async (updatedStructureData: Structure) => {
    if (!updatedStructureData || !updatedStructureData.id) return false;
    console.log(`Updating structure ${updatedStructureData.id}...`);
    setIsLoading(true);
    try {
        // Ensure acts/beats are properly formatted for Supabase (JSON)
        const actsAsJson = updatedStructureData.acts as unknown as Json;

        const { error } = await supabase
            .from('structures')
            .update({ 
                name: updatedStructureData.name, 
                description: updatedStructureData.description,
                beats: actsAsJson, // Save the acts/beats structure
                updated_at: new Date().toISOString()
            })
            .eq('id', updatedStructureData.id);

        if (error) throw error;

        console.log(`Successfully updated structure ${updatedStructureData.id}.`);
        // Update local state to reflect the change immediately
        setStructures(prev => prev.map(s => s.id === updatedStructureData.id ? updatedStructureData : s));
        if (selectedStructureId === updatedStructureData.id) {
            setSelectedStructure(updatedStructureData);
        }
        toast({ description: "Structure updated." });
        return true;
    } catch (error) {
        console.error('Error updating structure:', error);
        toast({ title: "Error", description: "Failed to update structure.", variant: "destructive" });
        return false;
    } finally {
        setIsLoading(false);
    }
}, [selectedStructureId]); // Dependency on selectedStructureId to update selectedStructure

  // Effect to fetch structures and linked structure on mount or when projectId changes
  useEffect(() => {
    fetchStructures().then(availableStructures => {
        if (projectId) {
            fetchLinkedStructure(availableStructures);
        }
        // If no projectId, maybe select the first structure by default?
        else if (availableStructures.length > 0) {
             setSelectedStructureId(availableStructures[0].id);
        }
    });
  }, [projectId, fetchStructures, fetchLinkedStructure]);

  // Effect to update the selectedStructure object when selectedStructureId or structures list changes
  useEffect(() => {
    if (selectedStructureId) {
      const structure = structures.find(s => s.id === selectedStructureId) || null;
      console.log(`Selected structure object updated: ${structure?.name || 'None'}`);
      setSelectedStructure(structure);
    } else {
      setSelectedStructure(null);
    }
  }, [selectedStructureId, structures]);

  // Handler to change the selected structure and link it
  const handleStructureChange = useCallback(async (structureId: string) => {
    if (structureId === selectedStructureId) return; // No change
    console.log(`Attempting to change structure to ${structureId}`);
    setSelectedStructureId(structureId);
    if (projectId) {
      await linkStructureToProject(structureId);
    }
  }, [selectedStructureId, projectId, linkStructureToProject]);

  return {
    structures,
    selectedStructureId,
    selectedStructure,
    isLoading,
    fetchStructures, // Expose fetch function if needed externally
    handleStructureChange,
    updateStructure // Expose update function
  };
}

export default useStructures;

