
import { useState, useEffect, useCallback } from 'react';
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
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(new Set());
  const { session } = useAuth();
  const navigate = useNavigate();

  const fetchStructures = useCallback(async () => {
    if (!session) {
      setStructures([]);
      setIsLoading(false);
      return;
    }
    
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
    } catch (error) {
      console.error('Error fetching structures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load structures. Please refresh the page.',
        variant: 'destructive',
      });
      setStructures([]);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

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
      const newStructure = await createStructureInSupabase(structureType);
      
      if (newStructure) {
        // Update local state first for immediate UI feedback
        setStructures(prev => [newStructure, ...prev]);
        // Navigate to the new structure
        navigate(`/structure/${newStructure.id}`);
      }
    } catch (error) {
      console.error('Error creating structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to create structure. Please try again.',
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
      const result = await updateStructureInSupabase(updatedStructure);
      
      // Update local state
      setStructures(prev => 
        prev.map(structure => 
          structure.id === updatedStructure.id ? result : structure
        )
      );
      
      return;
    } catch (error) {
      console.error('Error updating structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to update structure. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleEditStructure = (structure: Structure) => {
    navigate(`/structure/${structure.id}`);
  };

  const handleDeleteStructure = async (id: string) => {
    // Prevent multiple deletion attempts
    if (pendingDeletions.has(id)) return;
    
    // Immediately remove from UI for responsive feel
    setStructures(prev => prev.filter(structure => structure.id !== id));
    setPendingDeletions(prev => new Set(prev).add(id));
    
    try {
      const { success, linkedProjectsMessage, error } = await deleteStructureFromSupabase(id);
      
      if (success) {
        toast({
          title: "Structure deleted",
          description: "The structure has been deleted successfully."
        });
        
        if (linkedProjectsMessage) {
          toast({
            title: "Links removed",
            description: linkedProjectsMessage
          });
        }
      } else if (error) {
        // If deletion failed, add the structure back to the list
        fetchStructures(); // Refresh the full list to ensure consistency
        
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Unexpected error during structure deletion:', error);
      // Refresh the list on unexpected errors
      fetchStructures();
      
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Remove from pending deletions
      setPendingDeletions(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
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
