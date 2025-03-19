import { Structure } from '@/lib/types';
import { createClient } from '@/integrations/supabase/client'; // Fix the import path

/**
 * Calculate the overall progress of a structure based on beat completion
 */
export const calculateStructureProgress = (structure: Structure): number => {
  if (!structure || !structure.acts) {
    return 0;
  }

  let totalBeats = 0;
  let completedBeats = 0;

  structure.acts.forEach(act => {
    if (act.beats) {
      totalBeats += act.beats.length;
      completedBeats += act.beats.filter(beat => beat.complete).length;
    }
  });

  return totalBeats > 0 ? (completedBeats / totalBeats) * 100 : 0;
};

/**
 * Update the completion status of a beat in the structure
 */
export const updateStructureBeatCompletion = (
  structure: Structure,
  beatId: string,
  actId: string,
  complete: boolean
): Structure | null => {
  if (!structure || !structure.acts) {
    console.error('Invalid structure object');
    return null;
  }

  try {
    // Create a deep copy to avoid mutating the original
    const updatedStructure = JSON.parse(JSON.stringify(structure)) as Structure;
    
    // Find the act and beat within the structure
    const act = updatedStructure.acts.find(a => a.id === actId);
    if (!act) {
      console.error(`Act with ID ${actId} not found`);
      return null;
    }
    
    const beat = act.beats.find(b => b.id === beatId);
    if (!beat) {
      console.error(`Beat with ID ${beatId} not found in act ${actId}`);
      return null;
    }
    
    // Update the beat completion status
    beat.complete = complete;
    
    return updatedStructure;
  } catch (error) {
    console.error('Error updating beat completion:', error);
    return null;
  }
};

/**
 * Save the modified structure with updated beat completion status to Supabase
 */
export const saveStructureBeatCompletion = async (
  structureId: string, 
  updatedStructure: Structure
): Promise<boolean> => {
  try {
    const supabase = createClient();
    
    // Prepare the structure data for update (ensure it matches the database schema)
    const structureData = {
      id: updatedStructure.id,
      name: updatedStructure.name,
      structure_type: updatedStructure.structure_type,
      acts: updatedStructure.acts,
      // Add any other fields that might be required by your database schema
      // Note: Don't include description since it doesn't exist on the Act type
    };
    
    // Update the structure in Supabase
    const { error } = await supabase
      .from('structures')
      .update(structureData)
      .eq('id', structureId);
    
    if (error) {
      console.error('Error saving structure to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveStructureBeatCompletion:', error);
    return false;
  }
};

/**
 * Fetches structures from Supabase for a given project
 */
export const fetchStructuresFromSupabase = async (projectId: string) => {
  const supabase = createClient();
  let error = '';
  let allStructures = null;
  let linkedStructureId = null;
  
  try {
    // First fetch structures linked to this project
    const { data: linkData, error: linkError } = await supabase
      .from('project_structures')
      .select('structure_id')
      .eq('project_id', projectId);
    
    if (linkError) {
      console.error('Error fetching structure links:', linkError);
      error = 'Failed to fetch linked structures';
      return { allStructures, linkedStructureId, error };
    }
    
    // Get the linked structure ID if any
    if (linkData && linkData.length > 0) {
      linkedStructureId = linkData[0].structure_id;
    }
    
    // Fetch all available structures
    const { data: structuresData, error: structuresError } = await supabase
      .from('structures')
      .select('*');
    
    if (structuresError) {
      console.error('Error fetching structures:', structuresError);
      error = 'Failed to fetch structures';
      return { allStructures, linkedStructureId, error };
    }
    
    allStructures = structuresData;
  } catch (err) {
    console.error('Exception in fetchStructuresFromSupabase:', err);
    error = 'An error occurred while fetching structures';
  }
  
  return { allStructures, linkedStructureId, error };
};

/**
 * Parse structure data from Supabase into the app's Structure format
 */
export const parseStructureData = (structureData: any): Structure => {
  let acts = [];
  
  try {
    // Parse the beats JSON field if it exists
    if (typeof structureData.beats === 'string') {
      acts = JSON.parse(structureData.beats);
    } else if (structureData.beats && Array.isArray(structureData.beats)) {
      acts = structureData.beats;
    }
  } catch (e) {
    console.error('Error parsing structure data beats:', e);
    acts = [];
  }
  
  // Convert to the app's Structure format
  return {
    id: structureData.id,
    name: structureData.name,
    description: structureData.description,
    structure_type: structureData.structure_type,
    acts: acts,
    createdAt: new Date(structureData.created_at).toISOString(),
    updatedAt: new Date(structureData.updated_at).toISOString(),
  };
};

/**
 * Link a structure to a project in Supabase
 */
export const linkStructureToProject = async (projectId: string, structureId: string): Promise<boolean> => {
  const supabase = createClient();
  
  try {
    // First check if there's an existing link
    const { data: existingLinks, error: checkError } = await supabase
      .from('project_structures')
      .select('*')
      .eq('project_id', projectId);
    
    if (checkError) {
      console.error('Error checking existing project structure links:', checkError);
      return false;
    }
    
    // If links exist, update the existing one
    if (existingLinks && existingLinks.length > 0) {
      const { error: updateError } = await supabase
        .from('project_structures')
        .update({ structure_id: structureId })
        .eq('project_id', projectId);
      
      if (updateError) {
        console.error('Error updating project structure link:', updateError);
        return false;
      }
    } else {
      // Otherwise, create a new link
      const { error: insertError } = await supabase
        .from('project_structures')
        .insert([{ project_id: projectId, structure_id: structureId }]);
      
      if (insertError) {
        console.error('Error creating project structure link:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception in linkStructureToProject:', error);
    return false;
  }
};
