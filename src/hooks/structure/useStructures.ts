
import { useState, useEffect, useCallback } from 'react';
import { Structure } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { StructureHookProps, StructureHookReturn } from './types';
import { 
  fetchStructuresFromSupabase, 
  parseStructureData, 
  updateStructureBeatCompletion, 
  saveStructureBeatCompletion,
  linkStructureToProject
} from './structureUtils';

const useStructures = ({ projectId }: StructureHookProps): StructureHookReturn => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchStructures = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { allStructures, linkedStructureId, error: fetchError } = 
        await fetchStructuresFromSupabase(projectId);
      
      if (fetchError) {
        setError(fetchError);
        return;
      }
      
      if (allStructures) {
        const parsedStructures: Structure[] = allStructures.map(parseStructureData);
        setStructures(parsedStructures);
        
        if (linkedStructureId) {
          setSelectedStructureId(linkedStructureId);
          
          const linkedStructure = parsedStructures.find(s => s.id === linkedStructureId);
          if (linkedStructure) {
            setSelectedStructure(linkedStructure);
          }
        } else if (parsedStructures.length > 0) {
          setSelectedStructureId(parsedStructures[0].id);
          setSelectedStructure(parsedStructures[0]);
        }
      }
    } catch (error) {
      console.error('Error in fetchStructures:', error);
      setError('Failed to fetch structures');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const handleStructureChange = useCallback(async (structureId: string) => {
    console.log("Changing structure to:", structureId);
    
    const newSelectedStructure = structures.find(s => s.id === structureId);
    if (!newSelectedStructure) {
      console.error('Structure not found:', structureId);
      return;
    }
    
    setSelectedStructureId(structureId);
    setSelectedStructure(newSelectedStructure);
    
    if (projectId) {
      const success = await linkStructureToProject(projectId, structureId);
      if (!success) {
        toast({
          title: 'Error',
          description: 'Failed to link structure to project',
          variant: 'destructive'
        });
      } else {
        console.log('Structure linked to project successfully');
      }
    }
  }, [projectId, structures]);

  const updateBeatCompletion = useCallback((beatId: string, actId: string, complete: boolean) => {
    const updatedStructure = updateStructureBeatCompletion(
      selectedStructure, 
      beatId, 
      actId, 
      complete
    );
    
    if (updatedStructure) {
      setSelectedStructure(updatedStructure);
    }
    
    return updatedStructure;
  }, [selectedStructure]);

  return {
    structures,
    selectedStructureId,
    selectedStructure,
    isLoading,
    error,
    handleStructureChange,
    updateBeatCompletion,
    saveBeatCompletion,
    fetchStructures
  };
};

export default useStructures;
