
import { Structure } from '@/lib/types';
import useStructures from './structure/useStructures';

const useProjectStructures = (projectId?: string) => {
  return useStructures({ projectId });
};

export default useProjectStructures;
