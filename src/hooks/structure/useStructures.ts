
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
      console.log('Fetching structures for project:', projectId);
      const { allStructures, linkedStructureId, error: fetchError } = 
        await fetchStructuresFromSupabase(projectId);
        
      if (fetchError) {
        setError(fetchError);
        return;
      }
      
      if (allStructures && Array.isArray(allStructures)) {
        console.log('Received structures:', allStructures.length);
        const parsedStructures = allStructures.map(structureData => 
          parseStructureData(structureData)
        );
        
        setStructures(parsedStructures);
        
        if (linkedStructureId) {
          console.log('Setting selected structure ID from link:', linkedStructureId);
          setSelectedStructureId(linkedStructureId);
          const linkedStructure = parsedStructures.find(s => s.id === linkedStructureId);
          if (linkedStructure) {
            console.log('Setting selected structure from link:', linkedStructure.name);
            setSelectedStructure(linkedStructure);
          }
        } else if (parsedStructures.length > 0) {
          console.log('No linked structure, defaulting to first structure:', parsedStructures[0].name);
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
    
    console.log('handleStructureChange called with:', structureId);
    setSelectedStructureId(structureId);
    const structure = structures.find(s => s.id === structureId) || null;
    
    if (structure) {
      console.log('Setting selected structure to:', structure.name);
      setSelectedStructure(structure);
    } else {
      console.log('Structure not found in available structures');
    }
    
    try {
      await linkStructureToProject(projectId, structureId);
    } catch (err) {
      console.error('Error linking structure to project:', err);
      setError('Failed to link structure to project');
    }
  };

  // Implement the update beat completion function
  const updateBeatCompletionHandler = (beatId: string, actId: string, complete: boolean) => {
    return updateStructureBeatCompletion(selectedStructure, beatId, actId, complete);
  };

  // Implement the save beat completion function
  const saveBeatCompletionHandler = async (structureId: string, updatedStructure: Structure) => {
    return await saveStructureBeatCompletion(structureId, updatedStructure);
  };

  return {
    structures,
    selectedStructureId,
    selectedStructure,
    isLoading,
    error,
    handleStructureChange,
    updateBeatCompletion: updateBeatCompletionHandler,
    saveBeatCompletion: saveBeatCompletionHandler,
    fetchStructures,
    updateStructure: async () => false // Add stub for missing updateStructure
  };
};

export default useStructures;
