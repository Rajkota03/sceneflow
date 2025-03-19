
import { useState, useEffect } from 'react';
import { Structure } from '@/lib/types';
import useStructures from './structure/useStructures';

const useProjectStructures = (projectId?: string) => {
  // Get all values from useStructures including fetchStructures
  const structureHookResult = useStructures({ projectId });
  
  // Track script-to-structure integration status
  const [isStructureMapped, setIsStructureMapped] = useState(false);
  
  // Set up initial structure sync when component mounts
  useEffect(() => {
    if (projectId && structureHookResult.structures?.length > 0 && !isStructureMapped) {
      console.log('Setting up screenplay structure mapping for project', projectId);
      setIsStructureMapped(true);
    }
  }, [projectId, structureHookResult.structures, isStructureMapped]);
  
  // Make sure we're explicitly returning everything including fetchStructures
  return {
    structures: structureHookResult.structures,
    selectedStructureId: structureHookResult.selectedStructureId,
    selectedStructure: structureHookResult.selectedStructure,
    isLoading: structureHookResult.isLoading,
    error: structureHookResult.error,
    handleStructureChange: structureHookResult.handleStructureChange,
    updateBeatCompletion: structureHookResult.updateBeatCompletion,
    saveBeatCompletion: structureHookResult.saveBeatCompletion,
    fetchStructures: structureHookResult.fetchStructures,
    isStructureMapped
  };
};

export default useProjectStructures;
