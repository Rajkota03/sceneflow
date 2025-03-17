
import { Structure } from '@/lib/models/structureModel';

export interface UseStructureResult {
  structure: Structure | null;
  isLoading: boolean;
  error: Error | null;
  isSaving: boolean;
  lastSaved: Date | null;
  saveStructure: (updatedStructure: Structure) => Promise<Structure>;
  updateStructure: (updatedStructure: Structure) => Promise<Structure>;
}
