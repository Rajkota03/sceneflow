
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act } from '@/lib/models/structureModel';
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
