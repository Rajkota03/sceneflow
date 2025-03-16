
import { supabase } from '@/integrations/supabase/client';
import { ThreeActStructure, Note, serializeNotes, deserializeNotes, StoryBeat } from '@/lib/types';
import { Json } from '@/integrations/supabase/types';

// Function to fetch a structure from the structures table
export const fetchStructure = async (structureId: string): Promise<ThreeActStructure | null> => {
  try {
    const { data, error } = await supabase
      .from('structures')
      .select('*')
      .eq('id', structureId)
      .single();
      
    if (error) {
      console.error('Error fetching structure:', error);
      return null;
    }
    
    if (data) {
      // Convert database model to application model
      return {
        id: data.id,
        projectId: data.projectId || '', // Handle missing projectId
        projectTitle: data.name, // Use name as projectTitle
        beats: Array.isArray(data.beats) ? data.beats.map((beat: any) => ({
          id: beat.id || `beat-${Date.now()}`,
          title: beat.title || 'Untitled Beat',
          description: beat.description || '',
          position: beat.position || 0,
          actNumber: beat.actNumber || 1,
          isMidpoint: !!beat.isMidpoint
        })) : [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as ThreeActStructure;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching structure:', error);
    return null;
  }
};

// Add these exported functions to match the imports in useThreeActStructure.tsx
export const fetchStructureData = async (projectId: string, userId: string): Promise<ThreeActStructure | null> => {
  try {
    console.log(`Fetching structure data for project: ${projectId}`);
    const { data, error } = await supabase
      .from('structures')
      .select('*')
      .eq('projectId', projectId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No structure found for this project, will create one');
        return null;
      }
      console.error('Error fetching structure data:', error);
      return null;
    }
    
    if (data) {
      // Convert database model to application model
      return {
        id: data.id,
        projectId: data.projectId || projectId,
        projectTitle: data.name,
        beats: Array.isArray(data.beats) ? data.beats.map((beat: any) => ({
          id: beat.id || `beat-${Date.now()}`,
          title: beat.title || 'Untitled Beat',
          description: beat.description || '',
          position: beat.position || 0,
          actNumber: beat.actNumber || 1,
          isMidpoint: !!beat.isMidpoint
        })) : [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as ThreeActStructure;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching structure data:', error);
    return null;
  }
};

export const saveStructureData = async (structure: ThreeActStructure, projectId: string, userId: string): Promise<ThreeActStructure> => {
  try {
    console.log(`Saving structure data for project: ${projectId}`);
    
    // Prepare the structure data for the database
    const dbStructure = {
      id: structure.id,
      projectId: projectId,
      name: structure.projectTitle || 'Untitled Structure',
      description: 'Three-act structure for screenplay',
      beats: structure.beats.map(beat => ({
        id: beat.id,
        title: beat.title,
        description: beat.description,
        position: beat.position,
        actNumber: beat.actNumber,
        isMidpoint: !!beat.isMidpoint
      })),
      updated_at: new Date().toISOString()
    };
    
    // Check if the structure already exists
    const { data: existingData, error: checkError } = await supabase
      .from('structures')
      .select('id')
      .eq('id', structure.id)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing structure:', checkError);
    }
    
    let result;
    
    if (existingData) {
      // Update existing structure
      const { data, error } = await supabase
        .from('structures')
        .update(dbStructure)
        .eq('id', structure.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating structure:', error);
        throw new Error('Failed to update structure');
      }
      
      result = data;
    } else {
      // Insert new structure
      const { data, error } = await supabase
        .from('structures')
        .insert({ ...dbStructure, created_at: new Date().toISOString() })
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting structure:', error);
        throw new Error('Failed to create structure');
      }
      
      result = data;
    }
    
    // Convert the result back to the application model
    return {
      id: result.id,
      projectId: result.projectId || projectId,
      projectTitle: result.name,
      beats: Array.isArray(result.beats) ? result.beats.map((beat: any) => ({
        id: beat.id,
        title: beat.title,
        description: beat.description,
        position: beat.position,
        actNumber: beat.actNumber,
        isMidpoint: !!beat.isMidpoint
      })) : [],
      createdAt: result.created_at,
      updatedAt: result.updated_at
    } as ThreeActStructure;
  } catch (error) {
    console.error('Error saving structure data:', error);
    throw error;
  }
};

export const serializeStructure = (
  structure: ThreeActStructure
): any => {
  // Serialize beats to format appropriate for storage
  const beats = structure.beats.map(beat => ({
    id: beat.id,
    title: beat.title,
    description: beat.description,
    position: beat.position,
    actNumber: beat.actNumber,
    isMidpoint: !!beat.isMidpoint
  }));
  
  console.log('Serialized beats for storage:', beats);
  console.log('Structure to be saved:', {
    id: structure.id,
    projectId: structure.projectId,
    beats: beats.length
  });
  
  return {
    id: structure.id,
    projectId: structure.projectId,
    projectTitle: structure.projectTitle,
    beats,
    createdAt: structure.createdAt,
    updatedAt: structure.updatedAt
  };
};

export const deserializeStructure = (data: any): ThreeActStructure | null => {
  if (!data) return null;
  
  try {
    const beats = Array.isArray(data.beats)
      ? data.beats.map((beat: any) => ({
          id: beat.id || `beat-${Date.now()}`,
          title: beat.title || 'Untitled Beat',
          description: beat.description || '',
          position: beat.position || 0,
          actNumber: beat.actNumber || 1,
          isMidpoint: !!beat.isMidpoint
        }))
      : [];
      
    return {
      id: data.id,
      projectId: data.projectId,
      projectTitle: data.projectTitle,
      beats: beats,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
    };
  } catch (error) {
    console.error('Error deserializing structure:', error);
    return null;
  }
};

export const saveStructureToProject = async (
  structure: ThreeActStructure
) => {
  try {
    console.log("Saving structure:", structure.id);
    console.log("Structure beats count:", structure.beats?.length || 0);
    console.log("Full structure data:", JSON.stringify(structure, null, 2));
    
    // First, get the current notes array
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('notes')
      .eq('id', structure.projectId)
      .single();
    
    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error('Failed to fetch project');
    }
    
    let notes = data.notes ? deserializeNotes(data.notes as any[]) : [];
    
    // Find if there's an existing structure for this project
    const existingStructureIndex = notes.findIndex(
      note => note.id === structure.id
    );
    
    // Serialize the structure for storage
    const serializedStructure = serializeStructure(structure);
    console.log("Serialized structure:", serializedStructure);
    
    if (existingStructureIndex >= 0) {
      console.log("Updating existing structure at index:", existingStructureIndex);
      notes[existingStructureIndex] = serializedStructure;
    } else {
      console.log("Adding new structure to notes");
      notes.push(serializedStructure);
    }
    
    console.log("Updating project with structure, notes count:", notes.length);
    
    // Update the project with the new notes array
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        notes: serializeNotes(notes),
        updated_at: new Date().toISOString()
      })
      .eq('id', structure.projectId);
    
    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error('Failed to save story structure');
    }
    
    console.log('Structure saved successfully');
    return structure;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteStructureFromProject = async (projectId: string, structureId: string) => {
  try {
    // First, get the current notes array
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('notes')
      .eq('id', projectId)
      .single();
      
    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error('Failed to fetch project');
    }
    
    let notes = data.notes ? deserializeNotes(data.notes as any[]) : [];
    
    // Filter out the structure to be deleted
    const updatedNotes = notes.filter(note => note.id !== structureId);
    
    // Update the project with the new notes array
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        notes: serializeNotes(updatedNotes),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);
      
    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error('Failed to delete story structure');
    }
    
    console.log('Structure deleted successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
