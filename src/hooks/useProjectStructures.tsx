
import { Structure } from '@/lib/types';
import useStructures from './structure/useStructures';

const useProjectStructures = (projectId?: string) => {
  // Return the full hook result including fetchStructures
  return useStructures({ projectId });
};

export default useProjectStructures;
