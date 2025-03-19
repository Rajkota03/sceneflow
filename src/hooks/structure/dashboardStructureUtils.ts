
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { 
  createThreeActStructure, 
  createSaveTheCatStructure, 
  createHeroJourneyStructure, 
  createStoryCircleStructure 
} from '@/lib/structureTemplates';
import { StructureType } from './useDashboardStructures';

/**
 * Creates a new structure in Supabase based on the given structure type
 */
export const createStructureInSupabase = async (structureType: StructureType = 'three_act') => {
  try {
    const structureId = `structure-${Date.now()}`;
    let newStructure: Structure;
    
    // Create the appropriate structure based on type
    switch (structureType) {
      case 'save_the_cat':
        newStructure = createSaveTheCatStructure(structureId);
        break;
      case 'hero_journey':
        newStructure = createHeroJourneyStructure(structureId);
        break;
      case 'story_circle':
        newStructure = createStoryCircleStructure(structureId);
        break;
      case 'three_act':
      default:
        newStructure = createThreeActStructure(structureId);
        break;
    }
    
    const beatsData = JSON.stringify({ acts: newStructure.acts });
    
    const { error } = await supabase
      .from('structures')
      .insert({
        id: newStructure.id,
        name: newStructure.name,
        description: newStructure.description,
        beats: beatsData,
        structure_type: structureType
      });
    
    if (error) throw error;
    
    toast({
      title: "Structure created",
      description: `Your ${newStructure.name} has been created successfully.`
    });
    
    return newStructure;
  } catch (error) {
    console.error('Error creating structure:', error);
    toast({
      title: 'Error',
      description: 'Failed to create a new structure. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

/**
 * Updates an existing structure in Supabase
 */
export const updateStructureInSupabase = async (updatedStructure: Structure) => {
  try {
    const beatsData = JSON.stringify({ acts: updatedStructure.acts });
    
    const { error } = await supabase
      .from('structures')
      .update({
        name: updatedStructure.name,
        description: updatedStructure.description,
        beats: beatsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedStructure.id);
    
    if (error) throw error;
    
    return { 
      ...updatedStructure, 
      updatedAt: new Date().toISOString() 
    };
  } catch (error) {
    console.error('Error updating structure:', error);
    throw error;
  }
};

/**
 * Deletes a structure from Supabase and removes any project links
 */
export const deleteStructureFromSupabase = async (id: string) => {
  try {
    // First, check if any projects are currently using this structure
    const { data: linkedProjects, error: checkError } = await supabase
      .from('project_structures')
      .select('project_id')
      .eq('structure_id', id);
    
    if (checkError) {
      console.error('Error checking linked projects:', checkError);
      throw checkError;
    }
    
    // Remove links between this structure and any projects
    if (linkedProjects && linkedProjects.length > 0) {
      const { error: linkError } = await supabase
        .from('project_structures')
        .delete()
        .eq('structure_id', id);
      
      if (linkError) {
        console.error('Error removing structure links:', linkError);
        throw linkError;
      }
    }
    
    // Finally delete the structure itself
    const { error } = await supabase
      .from('structures')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting structure:', error);
      throw error;
    }
    
    // If any projects were linked to this structure, let the user know
    const projectLinkMessage = linkedProjects && linkedProjects.length > 0
      ? `${linkedProjects.length} project(s) were unlinked from this structure.`
      : null;
    
    return { success: true, linkedProjectsMessage: projectLinkMessage };
  } catch (error) {
    console.error('Error deleting structure:', error);
    return { success: false, error: 'Failed to delete the structure. Please try again.' };
  }
};

/**
 * Fetches all structures from Supabase
 */
export const fetchStructuresFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('structures')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    if (data) {
      const formattedStructures: Structure[] = data.map(structure => {
        let actsData: Act[] = [];
        try {
          if (typeof structure.beats === 'string') {
            const parsed = JSON.parse(structure.beats);
            actsData = parsed.acts || [];
          } else if (structure.beats && typeof structure.beats === 'object') {
            const beatsObj = structure.beats as any;
            actsData = beatsObj.acts || [];
          }
        } catch (e) {
          console.error('Error parsing beats data:', e);
          actsData = [];
        }
        
        return {
          id: structure.id,
          name: structure.name,
          description: structure.description || undefined,
          acts: actsData,
          createdAt: new Date(structure.created_at).toISOString(),
          updatedAt: new Date(structure.updated_at).toISOString(),
          structure_type: structure.structure_type || 'three_act'
        };
      });
      
      return { structures: formattedStructures, error: null };
    }
    
    return { structures: [], error: null };
  } catch (error) {
    console.error('Error fetching structures:', error);
    return { 
      structures: [], 
      error: 'Failed to load structures. Please try again.'
    };
  }
};
