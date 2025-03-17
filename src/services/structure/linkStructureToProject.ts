
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
