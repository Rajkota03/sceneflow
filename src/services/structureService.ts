import { supabase } from '@/integrations/supabase/client';
import { ThreeActStructure, StoryBeat, createDefaultStructure } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

/**
 * Fetches the structure for a specific project
 */
export const fetchStructureData = async (projectId: string, userId: string) => {
  try {
    console.log("Fetching structure for project:", projectId);
    const { data, error } = await supabase
      .from('projects')
      .select('notes')
      .eq('id', projectId)
      .eq('author_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching structure:', error);
      throw new Error('Failed to load story structure');
    }
    
    // Check if there's a three-act structure in the notes
    let structureData: ThreeActStructure | null = null;
    
    if (data?.notes && Array.isArray(data.notes)) {
      console.log("Found notes array, looking for structure");
      // Look for a note that contains the structure data
      const structureNote = data.notes.find((note: any) => 
        note && 
        typeof note === 'object' && 
        'id' in note && 
        typeof note.id === 'string' && 
        note.id.startsWith('structure-')
      );
      
      if (structureNote) {
        console.log("Found structure note:", structureNote.id);
        structureData = structureNote as unknown as ThreeActStructure;
        // Ensure dates are Date objects
        structureData.createdAt = new Date(structureData.createdAt);
        structureData.updatedAt = new Date(structureData.updatedAt);
      }
    }
    
    // If no structure found, create a default one
    if (!structureData) {
      console.log("No structure found, creating default");
      structureData = createDefaultStructure(projectId);
    }
    
    return structureData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

/**
 * Serializes a structure for storage in Supabase
 */
export const serializeStructureForStorage = (structure: ThreeActStructure) => {
  return {
    id: structure.id,
    projectId: structure.projectId,
    createdAt: structure.createdAt instanceof Date 
      ? structure.createdAt.toISOString() 
      : structure.createdAt,
    updatedAt: new Date().toISOString(), // Always use current time for updates
    beats: structure.beats.map(beat => ({
      id: beat.id,
      title: beat.title,
      description: beat.description,
      position: beat.position,
      actNumber: beat.actNumber
    }))
  };
};

/**
 * Saves the structure to the database
 */
export const saveStructureData = async (
  structure: ThreeActStructure, 
  projectId: string, 
  userId: string
) => {
  try {
    console.log("Saving structure:", structure.id);
    // First, get the current notes array
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('notes')
      .eq('id', projectId)
      .eq('author_id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching notes:', fetchError);
      throw new Error('Failed to update story structure');
    }
    
    // Prepare the notes array
    let notes = Array.isArray(data?.notes) ? [...data.notes] : [];
    
    // Find if there's an existing structure note
    const structureIndex = notes.findIndex((note: any) => 
      note && typeof note === 'object' && 
      typeof note.id === 'string' && 
      note.id.startsWith('structure-')
    );
    
    // Serialize the structure for storage
    const structureForStorage = serializeStructureForStorage(structure);
    
    // Update or add the structure note
    if (structureIndex >= 0) {
      notes[structureIndex] = structureForStorage;
    } else {
      notes.push(structureForStorage);
    }
    
    console.log("Updating project with structure");
    // Update the project with the new notes array
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('author_id', userId);
    
    if (updateError) {
      console.error('Error saving structure:', updateError);
      throw new Error('Failed to save story structure');
    }
    
    return structure;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
