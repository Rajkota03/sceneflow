
import { useState, useEffect } from 'react';
import { 
  getStructureByProjectId, 
  getStructureById,
  saveStructure as saveStructureToDb
} from '@/services/structureService';
import { Structure, createDefaultStructure } from '@/lib/models/structureModel';
import { v4 as uuidv4 } from 'uuid';

export function useStructure(projectId?: string, structureId?: string) {
  const [structure, setStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    async function loadStructure() {
      setIsLoading(true);
      try {
        if (structureId && structureId !== 'new') {
          // Load structure by ID
          const loadedStructure = await getStructureById(structureId);
          setStructure(loadedStructure);
        } else if (projectId) {
          // Load structure by project ID
          const loadedStructure = await getStructureByProjectId(projectId);
          setStructure(loadedStructure);
        } else if (structureId === 'new') {
          // Create a new structure
          const newStructure = createDefaultStructure();
          newStructure.id = uuidv4();
          setStructure(newStructure);
        } else {
          // Default empty structure
          const emptyStructure = createDefaultStructure();
          emptyStructure.id = uuidv4();
          setStructure(emptyStructure);
        }
      } catch (err) {
        console.error('Error loading structure:', err);
        setError(err instanceof Error ? err : new Error('Failed to load structure'));
      } finally {
        setIsLoading(false);
      }
    }

    loadStructure();
  }, [projectId, structureId]);

  const saveStructure = async (updatedStructure: Structure) => {
    // Don't save if already saving or less than 3 seconds since last save
    if (isSaving || (lastSaved && new Date().getTime() - lastSaved.getTime() < 3000)) {
      return updatedStructure;
    }
    
    setIsSaving(true);
    try {
      const saved = await saveStructureToDb(updatedStructure);
      setStructure(saved);
      setLastSaved(new Date());
      return saved;
    } catch (err) {
      console.error('Error saving structure:', err);
      setError(err instanceof Error ? err : new Error('Failed to save structure'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updateStructure = (updatedStructure: Structure) => {
    setStructure(updatedStructure);
  };

  return {
    structure,
    isLoading,
    error,
    isSaving,
    saveStructure,
    updateStructure
  };
}
