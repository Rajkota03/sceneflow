
import { supabase } from '@/integrations/supabase/client';
import { createDefaultStructure, Structure, Act, Beat } from '@/lib/models/structureModel';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

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
      acts: Array.isArray(item.beats) ? item.beats as unknown as Act[] : [],
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
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        console.log('No structure found with ID:', id);
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      acts: Array.isArray(data.beats) ? data.beats as unknown as Act[] : [],
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
    
    if (projectError) {
      console.log('Error fetching project:', projectError);
      if (projectError.code !== 'PGRST116') {
        throw projectError;
      }
    }
    
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
    newStructure.id = uuidv4(); // Ensure it has a UUID
    newStructure.createdAt = new Date();
    newStructure.updatedAt = new Date();
    
    const saved = await saveStructure(newStructure);
    
    // Link the structure to the project
    await linkStructureToProject(saved.id, projectId);
    
    return saved;
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
    // Ensure the structure has an ID
    if (!structure.id) {
      structure.id = uuidv4();
    }
    
    // Ensure dates are set
    if (!structure.createdAt) {
      structure.createdAt = new Date();
    }
    structure.updatedAt = new Date();
    
    // Convert dates to ISO strings for storage
    const created_at = structure.createdAt.toISOString();
    const updated_at = structure.updatedAt.toISOString();
    
    // Convert acts to JSON-compatible object for storage
    const { data, error } = await supabase
      .from('structures')
      .upsert({
        id: structure.id,
        name: structure.name,
        description: structure.description || '',
        beats: structure.acts as any, // Cast to any to avoid type errors
        created_at,
        updated_at,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error saving structure:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      projectTitle: structure.projectTitle || '',
      projectId: structure.projectId,
      acts: Array.isArray(data.beats) ? data.beats as unknown as Act[] : [],
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
    throw error;
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
    console.log('Linking structure', structureId, 'to project', projectId);
    
    // Remove any existing links for this project
    const { error: unlinkError } = await supabase
      .from('project_structures')
      .delete()
      .eq('project_id', projectId);
    
    if (unlinkError) {
      console.error('Error unlinking existing structures:', unlinkError);
      throw unlinkError;
    }
    
    // Create the new link
    const { error } = await supabase
      .from('project_structures')
      .insert({
        project_id: projectId,
        structure_id: structureId,
      });
    
    if (error) {
      console.error('Error linking structure to project:', error);
      throw error;
    }
    
    console.log('Successfully linked structure to project');
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
