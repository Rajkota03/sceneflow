
import { supabase } from '@/integrations/supabase/client';
import { createDefaultStructure, Structure } from '@/lib/models/structureModel';
import { toast } from '@/components/ui/use-toast';

export async function getStructures(): Promise<Structure[]> {
  try {
    const { data, error } = await supabase
      .from('structures')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      ...item,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      acts: item.beats || [],
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
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      acts: data.beats || [],
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
    const { data: linkedStructure, error: linkError } = await supabase
      .from('project_structures')
      .select('structure_id')
      .eq('project_id', projectId)
      .single();
    
    if (linkError && linkError.code !== 'PGRST116') {
      throw linkError;
    }
    
    if (linkedStructure?.structure_id) {
      return getStructureById(linkedStructure.structure_id);
    }
    
    // If no structure is linked, create a default one
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single();
    
    if (projectError) throw projectError;
    
    const newStructure = createDefaultStructure(projectId, project?.title || "Untitled Project");
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
    const { data, error } = await supabase
      .from('structures')
      .upsert({
        id: structure.id,
        name: structure.name,
        description: structure.description,
        beats: structure.acts,
        created_at: structure.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      acts: data.beats || [],
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
    await supabase
      .from('project_structures')
      .delete()
      .eq('structure_id', id);
    
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
    await supabase
      .from('project_structures')
      .delete()
      .eq('project_id', projectId);
    
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
