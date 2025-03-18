
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Structure, Act } from '@/lib/types';
import { useAuth } from '@/App';
import { useNavigate } from 'react-router-dom';
import { 
  createThreeActStructure, 
  createSaveTheCatStructure, 
  createHeroJourneyStructure, 
  createStoryCircleStructure 
} from '@/lib/structureTemplates';

export type StructureType = 'three_act' | 'save_the_cat' | 'hero_journey' | 'story_circle';

export const useDashboardStructures = () => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      fetchStructures();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchStructures = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedStructures: Structure[] = data.map(structure => {
          let actsData: Act[] = [];
          try {
            if (typeof structure.beats === 'string') {
              const parsed = JSON.parse(structure.beats);
              actsData = parsed.acts || [];
            } else if (structure.beats && typeof structure.beats === 'object') {
              const beatsObj = structure.beats as any;
              actsData = beatsObj.acts || [];
            }
          } catch (e) {
            console.error('Error parsing beats data:', e);
            actsData = [];
          }
          
          return {
            id: structure.id,
            name: structure.name,
            description: structure.description || undefined,
            acts: actsData,
            createdAt: new Date(structure.created_at).toISOString(), // Convert to string
            updatedAt: new Date(structure.updated_at).toISOString(), // Convert to string
            structure_type: structure.structure_type || 'three_act'
          };
        });
        
        setStructures(formattedStructures);
      }
    } catch (error) {
      console.error('Error fetching structures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load structures. Please try again.',
        variant: 'destructive',
      });
      setStructures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStructure = async (structureType: StructureType = 'three_act') => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a new structure',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const structureId = `structure-${Date.now()}`;
      let newStructure: Structure;
      
      // Create the appropriate structure based on type
      switch (structureType) {
        case 'save_the_cat':
          newStructure = createSaveTheCatStructure(structureId);
          break;
        case 'hero_journey':
          newStructure = createHeroJourneyStructure(structureId);
          break;
        case 'story_circle':
          newStructure = createStoryCircleStructure(structureId);
          break;
        case 'three_act':
        default:
          newStructure = createThreeActStructure(structureId);
          break;
      }
      
      const beatsData = JSON.stringify({ acts: newStructure.acts });
      
      const { error } = await supabase
        .from('structures')
        .insert({
          id: newStructure.id,
          name: newStructure.name,
          description: newStructure.description,
          beats: beatsData,
          structure_type: structureType
        });
      
      if (error) throw error;
      
      toast({
        title: "Structure created",
        description: `Your ${newStructure.name} has been created successfully.`
      });
      
      setStructures(prev => [newStructure, ...prev]);
      
      // Navigate to the new structure
      navigate(`/structure/${newStructure.id}`);
    } catch (error) {
      console.error('Error creating structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to create a new structure. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStructure = async (updatedStructure: Structure) => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to update this structure',
        variant: 'destructive',
      });
      throw new Error('Authentication required');
    }
    
    try {
      const beatsData = JSON.stringify({ acts: updatedStructure.acts });
      
      const { error } = await supabase
        .from('structures')
        .update({
          name: updatedStructure.name,
          description: updatedStructure.description,
          beats: beatsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedStructure.id);
      
      if (error) throw error;
      
      setStructures(prev => 
        prev.map(structure => 
          structure.id === updatedStructure.id 
            ? { ...updatedStructure, updatedAt: new Date().toISOString() } 
            : structure
        )
      );
      
      return;
    } catch (error) {
      console.error('Error updating structure:', error);
      throw error;
    }
  };

  const handleEditStructure = (structure: Structure) => {
    navigate(`/structure/${structure.id}`);
  };

  const handleDeleteStructure = async (id: string) => {
    try {
      const { error: linkError } = await supabase
        .from('project_structures')
        .delete()
        .eq('structure_id', id);
      
      if (linkError) throw linkError;
      
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStructures(prev => prev.filter(structure => structure.id !== id));
      
      toast({
        title: "Structure deleted",
        description: "The structure has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the structure. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredStructures = structures.filter(structure =>
    structure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (structure.description && structure.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return {
    structures: filteredStructures,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleCreateStructure,
    handleEditStructure,
    handleDeleteStructure,
    handleUpdateStructure
  };
};

export default useDashboardStructures;
