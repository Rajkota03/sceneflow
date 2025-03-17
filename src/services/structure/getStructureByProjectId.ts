
import { supabase } from '@/integrations/supabase/client';
import { Structure } from '@/lib/models/structureModel';
import { toast } from '@/components/ui/use-toast';
import { createDefaultStructure } from '@/lib/models/structureModel';
import { v4 as uuidv4 } from 'uuid';
import { getStructureById } from './getStructureById';
import { saveStructure } from './saveStructure';
import { linkStructureToProject } from './linkStructureToProject';

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
