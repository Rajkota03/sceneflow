import { supabase } from '@/integrations/supabase/client';
import { Structure, Act, Beat } from '@/lib/types';

export const fetchStructuresFromSupabase = async (projectId: string) => {
  try {
    // First check if the project has any linked structures
    const { data: linkData, error: linkError } = await supabase
      .from('project_structures')
      .select('structure_id')
      .eq('project_id', projectId);
    
    if (linkError) throw linkError;
    
    let linkedStructureId: string | null = null;
    if (linkData && linkData.length > 0) {
      linkedStructureId = linkData[0].structure_id;
    }
    
    // Get all available structures
    const { data: structuresData, error: structuresError } = await supabase
      .from('structures')
      .select('*');
    
    if (structuresError) throw structuresError;
    
    return { allStructures: structuresData, linkedStructureId, error: null };
  } catch (err: any) {
    console.error('Error fetching structures:', err);
    return { allStructures: null, linkedStructureId: null, error: err.message || 'Failed to load structures' };
  }
};

export const parseStructureData = (structureData: any): Structure => {
  let acts: Act[] = [];
  
  const structure: Structure = {
    id: structureData.id,
    name: structureData.name,
    description: structureData.description,
    createdAt: new Date(structureData.created_at).toISOString(),
    updatedAt: new Date(structureData.updated_at).toISOString(),
    structure_type: structureData.structure_type,
    projectTitle: structureData.projectTitle,
    acts: acts
  };
  
  try {
    if (typeof structureData.beats === 'string') {
      acts = JSON.parse(structureData.beats);
    } else if (structureData.beats && typeof structureData.beats === 'object') {
      acts = structureData.beats as Act[];
    }
    structure.acts = acts;
  } catch (e) {
    console.error('Error parsing beats:', e);
  }
  
  return structure;
};

export const linkStructureToProject = async (projectId: string, structureId: string) => {
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
  } catch (err: any) {
    console.error('Error linking structure to project:', err);
    throw new Error(err.message || 'Failed to link structure to project');
  }
};

export const updateStructureBeatCompletion = (
  selectedStructure: Structure | null, 
  beatId: string, 
  actId: string, 
  complete: boolean
): Structure | null => {
  if (!selectedStructure) return null;
  
  const updatedStructure = { ...selectedStructure };
  
  const actIndex = updatedStructure.acts.findIndex(act => act.id === actId);
  if (actIndex === -1) return null;
  
  const beatIndex = updatedStructure.acts[actIndex].beats.findIndex(beat => beat.id === beatId);
  if (beatIndex === -1) return null;
  
  updatedStructure.acts[actIndex].beats[beatIndex].complete = complete;
  
  return updatedStructure;
};

export const saveStructureBeatCompletion = async (structureId: string, updatedStructure: Structure) => {
  try {
    // Update the structure in the database - convert acts to JSON string
    const { error: updateError } = await supabase
      .from('structures')
      .update({ 
        beats: JSON.stringify(updatedStructure.acts), 
        updated_at: new Date().toISOString() 
      })
      .eq('id', structureId);
    
    if (updateError) throw updateError;
    return true;
  } catch (err: any) {
    console.error('Error saving beat completion:', err);
    return false;
  }
};

export const calculateStructureProgress = (structure: Structure | null): number => {
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

  if (totalBeats === 0) {
    return 0;
  }

  return (completedBeats / totalBeats) * 100;
};
