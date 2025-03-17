
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
