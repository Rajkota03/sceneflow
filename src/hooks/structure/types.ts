
import { Structure } from '@/lib/types';

export interface StructureHookProps {
  projectId?: string;
}

export interface StructureHookReturn {
  structures: Structure[];
  selectedStructureId: string | null;
  selectedStructure: Structure | null;
  isLoading: boolean;
  error: string;
  handleStructureChange: (structureId: string) => Promise<void>;
  updateBeatCompletion: (beatId: string, actId: string, complete: boolean) => Structure | null;
  saveBeatCompletion: (structureId: string, updatedStructure: Structure) => Promise<boolean>;
  fetchStructures: () => Promise<void>; // Make sure fetchStructures is defined in the return type
}
