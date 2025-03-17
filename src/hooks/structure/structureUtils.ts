
import { Structure } from '@/lib/models/structureModel';
import { 
  getStructureByProjectId, 
  getStructureById,
  saveStructure as saveStructureToDb
} from '@/services/structure';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

export const loadStructureById = async (structureId: string): Promise<Structure | null> => {
  console.log('Attempting to load structure by ID:', structureId);
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
  const newStructure = createDefaultStructure(projectId, projectTitle);
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

// Helper function imported from structureModel
const createDefaultStructure = (projectId?: string, projectTitle?: string): Structure => {
  return {
    id: '',
    name: projectTitle ? `${projectTitle} Structure` : 'Untitled Structure',
    description: '',
    projectId,
    projectTitle: projectTitle || '',
    acts: [
      {
        id: uuidv4(),
        title: 'Act One',
        colorHex: '#4338CA',
        startPosition: 0,
        endPosition: 25,
        beats: []
      },
      {
        id: uuidv4(),
        title: 'Act Two',
        colorHex: '#0369A1',
        startPosition: 25,
        endPosition: 75,
        beats: []
      },
      {
        id: uuidv4(),
        title: 'Act Three',
        colorHex: '#15803D',
        startPosition: 75,
        endPosition: 100,
        beats: []
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
};
