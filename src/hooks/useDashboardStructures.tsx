
import { useState, useEffect } from 'react';
import { Structure } from '@/lib/types';
import { StructureType } from '@/types/scriptTypes';
import { useAuth } from '@/App';
import { 
  fetchStructures, 
  createStructure, 
  updateStructure, 
  deleteStructure 
} from '@/lib/structureUtils';

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
      const fetchedStructures = await fetchStructures();
      setStructures(fetchedStructures);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStructure = async (structureType: StructureType): Promise<Structure | null> => {
    if (!session) return null;
    
    try {
      setIsCreating(true);
      const newStructure = await createStructure(structureType);
      
      if (newStructure) {
        setStructures([...structures, newStructure]);
      }
      
      return newStructure;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStructure = async (structure: Structure): Promise<boolean> => {
    if (!session) return false;
    
    const success = await updateStructure(structure);
    
    if (success) {
      setStructures(
        structures.map(s => (s.id === structure.id ? structure : s))
      );
    }
    
    return success;
  };

  const handleDeleteStructure = async (id: string): Promise<boolean> => {
    if (!session) return false;
    
    const success = await deleteStructure(id);
    
    if (success) {
      setStructures(structures.filter(s => s.id !== id));
    }
    
    return success;
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
