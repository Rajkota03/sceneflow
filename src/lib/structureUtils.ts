
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act, Beat } from '@/lib/types';
import { StructureType } from '@/types/scriptTypes';
import { Json } from '@/integrations/supabase/types';
import * as structureTemplates from '@/lib/structureTemplates';
import { toast } from '@/components/ui/use-toast';

// Convert database structure to application structure
export const formatDatabaseStructure = (dbStructure: any): Structure => {
  const beatsData = dbStructure.beats as unknown as Act[];
  let acts: Act[] = [];
  
  if (Array.isArray(beatsData)) {
    acts = beatsData;
  }
  
  return {
    id: dbStructure.id,
    name: dbStructure.name,
    description: dbStructure.description || '',
    acts: acts,
    created_at: dbStructure.created_at,
    updated_at: dbStructure.updated_at,
    structure_type: dbStructure.structure_type as StructureType
  };
};

// Fetch structures from database
export const fetchStructures = async (): Promise<Structure[]> => {
  try {
    const { data, error } = await supabase
      .from('structures')
      .select('*');
    
    if (error) {
      console.error('Error fetching structures:', error);
      toast({
        title: "Error",
        description: "Failed to load your story structures.",
        variant: "destructive",
      });
      return [];
    }
    
    return data.map(formatDatabaseStructure);
  } catch (error) {
    console.error('Error fetching structures:', error);
    toast({
      title: "Error",
      description: "Failed to load your story structures.",
      variant: "destructive",
    });
    return [];
  }
};

// Create a new structure
export const createStructure = async (structureType: StructureType): Promise<Structure | null> => {
  try {
    let template;
    switch (structureType) {
      case 'three_act':
        template = structureTemplates.createThreeActStructure('temp-id');
        break;
      case 'save_the_cat':
        template = structureTemplates.createSaveTheCatStructure('temp-id');
        break;
      case 'heroes_journey':
        template = structureTemplates.createHeroJourneyStructure('temp-id');
        break;
      case 'story_circle':
        template = structureTemplates.createStoryCircleStructure('temp-id');
        break;
      default:
        template = structureTemplates.createThreeActStructure('temp-id');
    }
    
    const { data, error } = await supabase
      .from('structures')
      .insert({
        name: template.name,
        description: template.description,
        structure_type: structureType,
        beats: template.acts as unknown as Json
      })
      .select();
    
    if (error) {
      console.error('Error creating structure:', error);
      toast({
        title: "Error",
        description: "Failed to create a new structure.",
        variant: "destructive",
      });
      return null;
    }
    
    if (data && data.length > 0) {
      const newStructure = formatDatabaseStructure(data[0]);
      
      toast({
        title: "Success",
        description: "New structure created successfully."
      });
      
      return newStructure;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating structure:', error);
    toast({
      title: "Error",
      description: "Failed to create a new structure.",
      variant: "destructive",
    });
    return null;
  }
};

// Update an existing structure
export const updateStructure = async (structure: Structure): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('structures')
      .update({
        name: structure.name,
        description: structure.description,
        beats: structure.acts as unknown as Json,
        updated_at: new Date().toISOString(),
        structure_type: structure.structure_type
      })
      .eq('id', structure.id);
    
    if (error) {
      console.error('Error updating structure:', error);
      toast({
        title: "Error",
        description: "Failed to update structure.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Success",
      description: "Structure updated successfully."
    });
    
    return true;
  } catch (error) {
    console.error('Error updating structure:', error);
    toast({
      title: "Error",
      description: "Failed to update structure.",
      variant: "destructive",
    });
    return false;
  }
};

// Delete a structure
export const deleteStructure = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('structures')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting structure:', error);
      toast({
        title: "Error",
        description: "Failed to delete structure.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Success",
      description: "Structure deleted successfully."
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting structure:', error);
    toast({
      title: "Error",
      description: "Failed to delete structure.",
      variant: "destructive",
    });
    return false;
  }
};
