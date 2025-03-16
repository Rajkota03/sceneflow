
import { useState, useEffect } from 'react';
import { 
  getStructureByProjectId, 
  saveStructure as saveStructureToDb
} from '@/services/structureService';
import { Structure, createDefaultStructure } from '@/lib/models/structureModel';

export function useStructure(projectId?: string) {
  const [structure, setStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadStructure() {
      setIsLoading(true);
      try {
        if (projectId) {
          const loadedStructure = await getStructureByProjectId(projectId);
          setStructure(loadedStructure);
        } else {
          setStructure(createDefaultStructure());
        }
      } catch (err) {
        console.error('Error loading structure:', err);
        setError(err instanceof Error ? err : new Error('Failed to load structure'));
      } finally {
        setIsLoading(false);
      }
    }

    loadStructure();
  }, [projectId]);

  const saveStructure = async (updatedStructure: Structure) => {
    try {
      const saved = await saveStructureToDb(updatedStructure);
      setStructure(saved);
      return saved;
    } catch (err) {
      console.error('Error saving structure:', err);
      setError(err instanceof Error ? err : new Error('Failed to save structure'));
      throw err;
    }
  };

  const updateStructure = (updatedStructure: Structure) => {
    setStructure(updatedStructure);
    saveStructure(updatedStructure).catch(console.error);
  };

  return {
    structure,
    isLoading,
    error,
    saveStructure,
    updateStructure
  };
}
