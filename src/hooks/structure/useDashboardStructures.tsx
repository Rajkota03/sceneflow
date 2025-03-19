
import { useState, useEffect } from 'react';
import { Structure } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/App';
import { useNavigate } from 'react-router-dom';
import { 
  createStructureInSupabase,
  updateStructureInSupabase,
  deleteStructureFromSupabase,
  fetchStructuresFromSupabase
} from './dashboardStructureUtils';

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
      const { structures: fetchedStructures, error } = await fetchStructuresFromSupabase();
      
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
        setStructures([]);
      } else {
        setStructures(fetchedStructures);
      }
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
    
    const newStructure = await createStructureInSupabase(structureType);
    
    if (newStructure) {
      setStructures(prev => [newStructure, ...prev]);
      // Navigate to the new structure
      navigate(`/structure/${newStructure.id}`);
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
      const result = await updateStructureInSupabase(updatedStructure);
      
      setStructures(prev => 
        prev.map(structure => 
          structure.id === updatedStructure.id ? result : structure
        )
      );
      
      return;
    } catch (error) {
      throw error;
    }
  };

  const handleEditStructure = (structure: Structure) => {
    navigate(`/structure/${structure.id}`);
  };

  const handleDeleteStructure = async (id: string) => {
    setIsLoading(true);
    try {
      const { success, linkedProjectsMessage, error } = await deleteStructureFromSupabase(id);
      
      if (success) {
        // Update local state first to maintain UI responsiveness
        setStructures(prev => prev.filter(structure => structure.id !== id));
        
        toast({
          title: "Structure deleted",
          description: "The structure has been deleted successfully."
        });
        
        // If any projects were linked to this structure, let the user know
        if (linkedProjectsMessage) {
          toast({
            title: "Links removed",
            description: linkedProjectsMessage
          });
        }
      } else if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
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
