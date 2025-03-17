
import { Structure } from '@/lib/models/structureModel';
import { 
  getStructureByProjectId, 
  getStructureById,
  saveStructure as saveStructureToDb
} from '@/services/structure';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { createDefaultStructure as createDefaultStructureModel } from '@/lib/models/structureModel';

export const loadStructureById = async (structureId: string): Promise<Structure | null> => {
  console.log('Attempting to load structure by ID:', structureId);
  if (structureId === 'new') {
    return createNewStructure();
  }
  const loadedStructure = await getStructureById(structureId);
  console.log('Loaded structure by ID result:', loadedStructure ? 'Found' : 'Not Found');
  return loadedStructure;
};

export const loadStructureByProjectId = async (projectId: string): Promise<Structure | null> => {
  console.log('Attempting to load structure by project ID:', projectId);
  const loadedStructure = await getStructureByProjectId(projectId);
  console.log('Loaded structure by project ID result:', loadedStructure ? 'Found' : 'Not Found');
  return loadedStructure;
};

export const createNewStructure = (projectId?: string, projectTitle?: string): Structure => {
  console.log('Creating new default structure');
  const newStructure = createDefaultStructureModel(projectId, projectTitle);
  newStructure.id = uuidv4();
  newStructure.createdAt = new Date();
  newStructure.updatedAt = new Date();
  return newStructure;
};

export const saveStructureWithUpdatedTimestamps = async (
  updatedStructure: Structure, 
  isManualSave: boolean = false
): Promise<Structure> => {
  try {
    // Ensure timestamps are updated
    updatedStructure.updatedAt = new Date();
    if (!updatedStructure.createdAt) {
      updatedStructure.createdAt = new Date();
    }
    
    // Safely handle projectId - fix for TypeScript error
    if (updatedStructure.projectId) {
      // Check if projectId is an object before trying to access its properties
      if (typeof updatedStructure.projectId === 'object' && 
          updatedStructure.projectId !== null) {
        // Now it's safe to check for _type property
        if ('_type' in updatedStructure.projectId && 
            updatedStructure.projectId._type === 'undefined') {
          updatedStructure.projectId = undefined;
        }
      }
    }
    
    console.log(isManualSave ? 'Manually saving structure:' : 'Auto-saving structure:', updatedStructure.id);
    const saved = await saveStructureToDb(updatedStructure);
    console.log(isManualSave ? 'Manual save complete, ID:' : 'Auto-save complete, new ID:', saved.id);
    
    return saved;
  } catch (err) {
    console.error('Error saving structure:', err);
    toast({
      title: 'Error saving structure',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    throw err instanceof Error ? err : new Error('Failed to save structure');
  }
};
