
import { useState, useEffect, useCallback } from 'react';
import { Structure } from '@/lib/types';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchStructures = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { allStructures, linkedStructureId, error: fetchError } = 
        await fetchStructuresFromSupabase(projectId);
        
      if (fetchError) {
        setError(fetchError);
        return;
      }
      
      if (allStructures && Array.isArray(allStructures)) {
        const parsedStructures = allStructures.map(structureData => 
          parseStructureData(structureData)
        );
        
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
    } catch (err) {
      console.error('Error in fetchStructures:', err);
      setError('Failed to fetch structures');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);
  
  const handleStructureChange = async (structureId: string) => {
    if (!projectId) return;
    
    setSelectedStructureId(structureId);
    const structure = structures.find(s => s.id === structureId) || null;
    setSelectedStructure(structure);
    
    try {
      await linkStructureToProject(projectId, structureId);
    } catch (err) {
      console.error('Error linking structure to project:', err);
      setError('Failed to link structure to project');
    }
  };

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
