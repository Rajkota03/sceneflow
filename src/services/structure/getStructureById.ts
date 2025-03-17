
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act } from '@/lib/models/structureModel';
import { toast } from '@/components/ui/use-toast';

export async function getStructureById(id: string): Promise<Structure | null> {
  try {
    console.log('Fetching structure with ID:', id);
    
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
    
    console.log('Structure found:', data.id);
    
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
