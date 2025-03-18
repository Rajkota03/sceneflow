
import { Structure, Act, Beat } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export async function fetchStructuresFromSupabase(projectId?: string) {
  if (!projectId) {
    return { allStructures: [], linkedStructureId: null, error: null };
  }
  
  try {
    const { data: allStructures, error: structuresError } = await supabase
      .from('structures')
      .select('*');
    
    if (structuresError) {
      console.error('Error fetching structures:', structuresError);
      return { allStructures: [], linkedStructureId: null, error: structuresError.message };
    }
    
    const { data: projectStructure, error: linkError } = await supabase
      .from('project_structures')
      .select('structure_id')
      .eq('project_id', projectId)
      .single();
    
    const linkedStructureId = projectStructure?.structure_id || null;
    
    return { 
      allStructures, 
      linkedStructureId,
      error: linkError && !linkError.message.includes('No rows found') ? linkError.message : null 
    };
  } catch (error) {
    console.error('Error in fetchStructuresFromSupabase:', error);
    return { 
      allStructures: [], 
      linkedStructureId: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export function parseStructureData(structureData: any): Structure {
  try {
    const acts = Array.isArray(structureData.acts) 
      ? structureData.acts 
      : (typeof structureData.acts === 'string' ? JSON.parse(structureData.acts) : []);
    
    return {
      id: structureData.id,
      name: structureData.name,
      description: structureData.description,
      structure_type: structureData.structure_type,
      created_at: structureData.created_at,
      updated_at: structureData.updated_at,
      acts: acts,
      createdAt: new Date(structureData.created_at).toISOString(),
      updatedAt: new Date(structureData.updated_at).toISOString(),
      author_id: structureData.author_id
    };
  } catch (parseError) {
    console.error('Error parsing structure data:', parseError);
    return {
      id: structureData.id,
      name: structureData.name,
      description: structureData.description || '',
      structure_type: structureData.structure_type || 'three_act',
      acts: [],
      createdAt: new Date(structureData.created_at).toISOString(),
      updatedAt: new Date(structureData.updated_at).toISOString(),
      author_id: structureData.author_id
    };
  }
}

export function updateStructureBeatCompletion(
  structure: Structure | null, 
  beatId: string, 
  actId: string, 
  complete: boolean
): Structure | null {
  if (!structure) {
    console.error('No structure selected');
    return null;
  }
  
  const updatedStructure = { ...structure };
  
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
}

export async function saveStructureBeatCompletion(
  structureId: string, 
  updatedStructure: Structure
): Promise<boolean> {
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
    
    return true;
  } catch (error) {
    console.error('Error in saveStructureBeatCompletion:', error);
    return false;
  }
}

export async function linkStructureToProject(
  projectId: string, 
  structureId: string
): Promise<boolean> {
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
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in linkStructureToProject:', error);
    return false;
  }
}
