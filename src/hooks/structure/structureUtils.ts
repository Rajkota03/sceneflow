
import { Structure, Act, Beat } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export const fetchStructuresFromSupabase = async (projectId: string) => {
  try {
    // Fetch all structures
    const { data: allStructures, error: fetchError } = await supabase
      .from('story_structures')
      .select('*');
      
    if (fetchError) {
      console.error('Error fetching structures:', fetchError);
      return { error: 'Failed to fetch structures' };
    }

    // Fetch the linked structure ID for this project
    const { data: projectLink, error: linkError } = await supabase
      .from('project_structures')
      .select('structure_id')
      .eq('project_id', projectId)
      .maybeSingle();
      
    if (linkError) {
      console.error('Error fetching project structure link:', linkError);
    }
    
    const linkedStructureId = projectLink?.structure_id || null;
    
    return { allStructures, linkedStructureId };
    
  } catch (error) {
    console.error('Error in fetchStructuresFromSupabase:', error);
    return { error: 'Failed to fetch structures from database' };
  }
};

export const parseStructureData = (data: any): Structure => {
  try {
    const structure: Structure = {
      id: data.id,
      name: data.name || 'Untitled Structure',
      description: data.description || '',
      acts: Array.isArray(data.content?.acts) ? data.content.acts : [],
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
      structure_type: data.structure_type || 'three_act'
    };
    
    // Ensure each act has an id and beats array
    structure.acts = structure.acts.map(act => ({
      ...act,
      id: act.id || `act-${Math.random().toString(36).substr(2, 9)}`,
      beats: Array.isArray(act.beats) ? act.beats : []
    }));
    
    return structure;
  } catch (error) {
    console.error('Error parsing structure data:', error);
    return {
      id: data.id || `structure-${Date.now()}`,
      name: 'Error Loading Structure',
      description: 'There was an error loading this structure',
      acts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

export const linkStructureToProject = async (projectId: string, structureId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_structures')
      .upsert({ 
        project_id: projectId, 
        structure_id: structureId,
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error linking structure to project:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in linkStructureToProject:', error);
    return false;
  }
};

export const updateStructureBeatCompletion = (
  structure: Structure | null, 
  beatId: string, 
  actId: string, 
  complete: boolean
): Structure | null => {
  if (!structure) return null;
  
  try {
    // Deep clone the structure to avoid modifying the original object
    const updatedStructure = JSON.parse(JSON.stringify(structure)) as Structure;
    
    // Find the specified act
    const actIndex = updatedStructure.acts.findIndex(act => act.id === actId);
    if (actIndex === -1) return null;
    
    // Find the beat within the act
    const beatIndex = updatedStructure.acts[actIndex].beats.findIndex(beat => beat.id === beatId);
    if (beatIndex === -1) return null;
    
    // Update the beat's completion status
    updatedStructure.acts[actIndex].beats[beatIndex].complete = complete;
    
    return updatedStructure;
  } catch (error) {
    console.error('Error updating beat completion:', error);
    return null;
  }
};

export const saveStructureBeatCompletion = async (
  structureId: string, 
  updatedStructure: Structure
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('story_structures')
      .update({ 
        content: { acts: updatedStructure.acts },
        updated_at: new Date().toISOString()
      })
      .eq('id', structureId);
      
    if (error) {
      console.error('Error saving structure updates:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveStructureBeatCompletion:', error);
    return false;
  }
};
