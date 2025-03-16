
import { supabase } from '@/integrations/supabase/client';
import { createDefaultStructure, Structure, Act, Beat } from '@/lib/models/structureModel';
import { toast } from '@/components/ui/use-toast';

export async function getStructures(): Promise<Structure[]> {
  try {
    const { data, error } = await supabase
      .from('structures')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      acts: Array.isArray(item.beats) ? item.beats as Act[] : [],
      projectTitle: '', // Set default value
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  } catch (error) {
    console.error('Error fetching structures:', error);
    toast({
      title: 'Error fetching structures',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
}

export async function getStructureById(id: string): Promise<Structure | null> {
  try {
    const { data, error } = await supabase
      .from('structures')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      acts: Array.isArray(data.beats) ? data.beats as Act[] : [],
      projectTitle: '', // Set default value
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching structure:', error);
    toast({
      title: 'Error fetching structure',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    return null;
  }
}

export async function getStructureByProjectId(projectId: string): Promise<Structure | null> {
  try {
    // First check if a structure is already linked to this project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single();
    
    if (projectError) throw projectError;
    
    // Check for linked structure
    const { data: linkData, error: linkError } = await supabase
      .from('project_structures')
      .select('structure_id')
      .eq('project_id', projectId)
      .single();
    
    if (linkError && linkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is fine
      throw linkError;
    }
    
    if (linkData?.structure_id) {
      const structure = await getStructureById(linkData.structure_id);
      if (structure) {
        structure.projectId = projectId;
        structure.projectTitle = projectData?.title || '';
        return structure;
      }
    }
    
    // If no structure is linked, create a default one
    const newStructure = createDefaultStructure(projectId, projectData?.title || "Untitled Project");
    await saveStructure(newStructure);
    
    // Link the structure to the project
    await linkStructureToProject(newStructure.id, projectId);
    
    return newStructure;
  } catch (error) {
    console.error('Error fetching structure for project:', error);
    toast({
      title: 'Error fetching structure',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    return null;
  }
}

export async function saveStructure(structure: Structure): Promise<Structure> {
  try {
    // Convert acts to JSON string for storage
    const { data, error } = await supabase
      .from('structures')
      .upsert({
        id: structure.id,
        name: structure.name,
        description: structure.description || '',
        beats: structure.acts, // Store acts in the beats column
        created_at: structure.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      projectTitle: structure.projectTitle || '',
      projectId: structure.projectId,
      acts: Array.isArray(data.beats) ? data.beats as Act[] : [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error saving structure:', error);
    toast({
      title: 'Error saving structure',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    return structure;
  }
}

export async function deleteStructure(id: string): Promise<boolean> {
  try {
    // Remove any project links first
    const { error: linkError } = await supabase
      .from('project_structures')
      .delete()
      .eq('structure_id', id);
    
    if (linkError) throw linkError;
    
    // Then delete the structure
    const { error } = await supabase
      .from('structures')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting structure:', error);
    toast({
      title: 'Error deleting structure',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    return false;
  }
}

export async function linkStructureToProject(structureId: string, projectId: string): Promise<boolean> {
  try {
    // Remove any existing links for this project
    const { error: unlinkError } = await supabase
      .from('project_structures')
      .delete()
      .eq('project_id', projectId);
    
    if (unlinkError) throw unlinkError;
    
    // Create the new link
    const { error } = await supabase
      .from('project_structures')
      .insert({
        project_id: projectId,
        structure_id: structureId,
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error linking structure to project:', error);
    toast({
      title: 'Error linking structure',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    return false;
  }
}
