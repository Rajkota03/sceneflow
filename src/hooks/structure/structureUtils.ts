import { Structure } from '@/lib/types';
import { createClient } from '@/lib/supabase';

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
