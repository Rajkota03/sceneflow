
import { Structure } from '@/lib/types';
import useStructures from './structure/useStructures';
import { calculateStructureProgress } from './structure/structureUtils';

const useProjectStructures = (projectId?: string) => {
  // Get all values from useStructures including fetchStructures
  const structureHookResult = useStructures({ projectId });
  
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
    calculateStructureProgress
  };
};

export default useProjectStructures;
