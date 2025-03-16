
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
        projectId: '', // Default to empty string since projectId isn't in the database structure
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
    
    // Instead of querying by projectId which doesn't exist in the structures table,
    // we'll look for a structure associated with this project in the projects table
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('notes')
      .eq('id', projectId)
      .single();
      
    if (projectError) {
      console.error('Error fetching project data:', projectError);
      return null;
    }
    
    // Look for a structure in the project's notes
    if (projectData && projectData.notes) {
      const notes = deserializeNotes(projectData.notes as any[]);
      const structureNote = notes.find(note => 
        note.id.startsWith('structure-')
      );
      
      if (structureNote) {
        // If we found a structure in the notes, construct a proper ThreeActStructure from it
        // Fix: Add null checks for structureNote.content
        const structureContent = structureNote.content;
        let beats: StoryBeat[] = [];
        
        if (Array.isArray(structureContent)) {
          beats = structureContent;
        } else if (typeof structureContent === 'object' && structureContent !== null) {
          beats = 'beats' in structureContent ? structureContent.beats : [];
        }
        
        return {
          id: structureNote.id,
          projectId: projectId,
          projectTitle: structureNote.title || 'Untitled Structure',
          beats: beats,
          createdAt: structureNote.createdAt,
          updatedAt: structureNote.updatedAt
        } as ThreeActStructure;
      }
    }
    
    // If no structure was found in the project's notes, return null
    return null;
  } catch (error) {
    console.error('Error fetching structure data:', error);
    return null;
  }
};

export const saveStructureData = async (structure: ThreeActStructure, projectId: string, userId: string): Promise<ThreeActStructure> => {
  try {
    console.log(`Saving structure data for project: ${projectId}`);
    
    // We won't save to the structures table directly because it doesn't have a projectId.
    // Instead, we'll save the structure as a note in the project's notes.
    return await saveStructureToProject(structure);
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
    title: structure.projectTitle || 'Untitled Structure',
    content: { 
      beats: beats
    },
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
    
    // First, we'll update the structures table (if it exists)
    const { data: structureData, error: structureError } = await supabase
      .from('structures')
      .upsert({
        id: structure.id,
        name: structure.projectTitle || 'Untitled Structure',
        description: 'Three-act structure for screenplay',
        beats: structure.beats.map(beat => ({
          id: beat.id,
          title: beat.title,
          description: beat.description,
          position: beat.position,
          actNumber: beat.actNumber,
          isMidpoint: beat.isMidpoint
        })),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (structureError) {
      console.error("Error updating structure:", structureError);
      // Continue anyway - we'll save to project notes as fallback
    }
    
    // Next, store the structure in the project's notes
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
    
    if (existingStructureIndex >= 0) {
      console.log("Updating existing structure at index:", existingStructureIndex);
      notes[existingStructureIndex] = serializedStructure;
    } else {
      console.log("Adding new structure to notes");
      notes.push(serializedStructure);
    }
    
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
