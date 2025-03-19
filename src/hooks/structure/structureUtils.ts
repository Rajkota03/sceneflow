import { Structure, Act, Beat } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export const fetchStructuresFromSupabase = async (projectId: string) => {
  try {
    console.log('Fetching structures for project ID:', projectId);
    
    // Fetch all structures - using 'structures' table, not 'story_structures'
    const { data: allStructures, error: fetchError } = await supabase
      .from('structures')
      .select('*');
      
    if (fetchError) {
      console.error('Error fetching structures:', fetchError);
      return { error: 'Failed to fetch structures' };
    }

    console.log('Fetched structures:', allStructures?.length || 0);

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
    console.log('Linked structure ID:', linkedStructureId);
    
    return { allStructures, linkedStructureId };
    
  } catch (error) {
    console.error('Error in fetchStructuresFromSupabase:', error);
    return { error: 'Failed to fetch structures from database' };
  }
};

export const parseStructureData = (data: any): Structure => {
  try {
    console.log('Parsing structure data:', data.id, data.name);
    
    let acts = [];
    
    // Try to parse acts from different possible locations in the data
    if (Array.isArray(data.acts)) {
      acts = data.acts;
    } else if (data.content && Array.isArray(data.content.acts)) {
      acts = data.content.acts;
    } else if (typeof data.beats === 'string') {
      try {
        const parsedBeats = JSON.parse(data.beats);
        if (Array.isArray(parsedBeats)) {
          acts = parsedBeats;
        } else if (parsedBeats && Array.isArray(parsedBeats.acts)) {
          acts = parsedBeats.acts;
        }
      } catch (e) {
        console.error('Error parsing beats JSON:', e);
      }
    } else if (data.beats && typeof data.beats === 'object') {
      if (Array.isArray(data.beats)) {
        acts = data.beats;
      } else if (data.beats.acts && Array.isArray(data.beats.acts)) {
        acts = data.beats.acts;
      }
    }
    
    console.log(`Structure ${data.id} has ${acts.length} acts`);
    
    const structure: Structure = {
      id: data.id,
      name: data.name || 'Untitled Structure',
      description: data.description || '',
      acts: acts,
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
    console.log('Linking structure to project:', structureId, projectId);
    
    // Updated to use 'project_structures' table, not 'story_structures'
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
    
    console.log('Successfully linked structure to project');
    return true;
  } catch (error) {
    console.error('Error in linkStructureToProject:', error);
    return false;
  }
};

export const updateStructureBeatCompletion = (
  structure: any,
  beatId: string,
  actId: string,
  isComplete: boolean
): any => {
  if (!structure || !structure.acts) {
    return null;
  }

  // Create a deep copy of the structure
  const updatedStructure = JSON.parse(JSON.stringify(structure));

  // Find the act and beat to update
  let actFound = false;
  let beatFound = false;

  // Ensure acts is treated as an array
  const acts = Array.isArray(updatedStructure.acts) 
    ? updatedStructure.acts 
    : updatedStructure.acts.acts || [];

  // Update the completion status
  for (let i = 0; i < acts.length; i++) {
    // Handle both possible shapes of act (with or without description)
    const act = acts[i];
    
    if (act.id === actId) {
      actFound = true;
      const beats = act.beats || [];
      for (let j = 0; j < beats.length; j++) {
        if (beats[j].id === beatId) {
          beats[j].complete = isComplete;
          beatFound = true;
          break;
        }
      }
      break;
    }
  }

  if (!actFound || !beatFound) {
    console.error('Act or beat not found', { actId, beatId });
    return null;
  }

  // Return the updated structure
  return updatedStructure;
};

export const saveStructureBeatCompletion = async (
  structureId: string, 
  updatedStructure: Structure
): Promise<boolean> => {
  try {
    console.log('Saving beat completion for structure:', structureId);
    
    // Make a serializable copy of the acts that will work with Supabase JSON types
    const serializableActs: any[] = updatedStructure.acts.map(act => ({
      id: act.id,
      title: act.title,
      description: act.description || "",
      beats: act.beats.map(beat => ({
        id: beat.id,
        title: beat.title,
        description: beat.description || "",
        complete: beat.complete || false,
        timePosition: beat.timePosition || 0,
        pageRange: beat.pageRange || "",
        notes: beat.notes || "",
        sceneCount: beat.sceneCount || 0
      }))
    }));
    
    // Updating the beats in the content field to ensure compatibility
    const { error } = await supabase
      .from('structures')
      .update({ 
        content: { acts: serializableActs },
        beats: { acts: serializableActs },
        updated_at: new Date().toISOString()
      })
      .eq('id', structureId);
      
    if (error) {
      console.error('Error saving structure updates:', error);
      return false;
    }
    
    console.log('Successfully saved beat completion');
    return true;
  } catch (error) {
    console.error('Error in saveStructureBeatCompletion:', error);
    return false;
  }
};

// Calculate structure progress based on completed beats
export const calculateStructureProgress = (structure: Structure | null): number => {
  if (!structure || !structure.acts || !Array.isArray(structure.acts)) {
    return 0;
  }
  
  let totalBeats = 0;
  let completedBeats = 0;
  
  structure.acts.forEach(act => {
    if (act.beats && Array.isArray(act.beats)) {
      totalBeats += act.beats.length;
      completedBeats += act.beats.filter(beat => beat.complete).length;
    }
  });
  
  return totalBeats > 0 ? (completedBeats / totalBeats) * 100 : 0;
};
