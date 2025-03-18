
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act, Beat } from '@/lib/types';
import { StructureType } from '@/types/scriptTypes';
import { Json } from '@/integrations/supabase/types';
import * as structureTemplates from '@/lib/structureTemplates';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';

export interface UseDashboardStructuresResult {
  structures: Structure[];
  isLoading: boolean;
  isCreating: boolean;
  refetch: () => Promise<void>;
  handleCreateStructure: (structureType: StructureType) => Promise<Structure | null>;
  handleUpdateStructure: (structure: Structure) => Promise<boolean>;
  handleDeleteStructure: (id: string) => Promise<boolean>;
}

const useDashboardStructures = (): UseDashboardStructuresResult => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      fetchUserStructures();
    }
  }, [session]);

  const fetchUserStructures = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      
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
        return;
      }
      
      // Transform the data to match the Structure type
      const formattedStructures: Structure[] = data.map(structure => {
        // Parse beats from JSON to convert to acts array
        // Use a type assertion to handle the Json to Act[] conversion
        const beatsData = structure.beats as unknown as Act[];
        let acts: Act[] = [];
        
        // Try to convert the beats data to acts structure
        if (Array.isArray(beatsData)) {
          acts = beatsData;
        }
        
        return {
          id: structure.id,
          name: structure.name,
          description: structure.description || '',
          acts: acts,
          created_at: structure.created_at,
          updated_at: structure.updated_at,
          structure_type: structure.structure_type as StructureType
        };
      });
      
      setStructures(formattedStructures);
    } catch (error) {
      console.error('Error fetching structures:', error);
      toast({
        title: "Error",
        description: "Failed to load your story structures.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStructure = async (structureType: StructureType): Promise<Structure | null> => {
    if (!session) return null;
    
    try {
      setIsCreating(true);
      
      // Get template based on structure type
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
      
      // Create the new structure in the database
      // Important: Fix the structure of the insert data to match the database schema
      const { data, error } = await supabase
        .from('structures')
        .insert({
          name: template.name,
          description: template.description,
          structure_type: structureType,
          beats: template.acts as unknown as Json
        })
        .select('*');
      
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
        const newStructureData = data[0];
        
        // Convert the database structure to the application structure
        const beatsData = newStructureData.beats as unknown as Act[];
        let acts: Act[] = [];
        
        // Try to convert the beats data to acts structure
        if (Array.isArray(beatsData)) {
          acts = beatsData;
        }
        
        const newStructure: Structure = {
          id: newStructureData.id,
          name: newStructureData.name,
          description: newStructureData.description || '',
          acts: acts,
          created_at: newStructureData.created_at,
          updated_at: newStructureData.updated_at,
          structure_type: newStructureData.structure_type as StructureType
        };
        
        // Update the local state
        setStructures([...structures, newStructure]);
        
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
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStructure = async (structure: Structure): Promise<boolean> => {
    if (!session) return false;
    
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
      
      // Update the local state
      setStructures(
        structures.map(s => (s.id === structure.id ? structure : s))
      );
      
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

  const handleDeleteStructure = async (id: string): Promise<boolean> => {
    if (!session) return false;
    
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
      
      // Update the local state
      setStructures(structures.filter(s => s.id !== id));
      
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

  const refetch = async () => {
    await fetchUserStructures();
  };

  return {
    structures,
    isLoading,
    isCreating,
    refetch,
    handleCreateStructure,
    handleUpdateStructure,
    handleDeleteStructure
  };
};

export default useDashboardStructures;
