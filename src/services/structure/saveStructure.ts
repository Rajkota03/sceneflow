
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act } from '@/lib/models/structureModel';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export async function saveStructure(structure: Structure): Promise<Structure> {
  try {
    // Ensure the structure has an ID
    if (!structure.id) {
      structure.id = uuidv4();
    }
    
    console.log('Saving structure with ID:', structure.id);
    
    // Ensure dates are set
    if (!structure.createdAt) {
      structure.createdAt = new Date();
    }
    structure.updatedAt = new Date();
    
    // Convert dates to ISO strings for storage
    const created_at = structure.createdAt.toISOString();
    const updated_at = structure.updatedAt.toISOString();
    
    // Safely handle projectId - Fix for TypeScript error
    let projectId = null;
    if (structure.projectId !== undefined && structure.projectId !== null) {
      if (typeof structure.projectId === 'object' && structure.projectId !== null) {
        // Now it's safe to check for _type property
        if ('_type' in structure.projectId && structure.projectId._type === 'undefined') {
          // Handle the case where projectId is an object with undefined value
          projectId = null;
        } else {
          projectId = structure.projectId;
        }
      } else {
        projectId = structure.projectId;
      }
    }
    
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
    
    if (!data) {
      console.error('No data returned from structure upsert');
      throw new Error('Failed to save structure');
    }
    
    console.log('Structure saved successfully:', data.id);
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      projectTitle: structure.projectTitle || '',
      projectId: projectId,
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
