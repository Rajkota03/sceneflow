
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getStructureByProjectId, 
  getStructureById,
  saveStructure as saveStructureToDb
} from '@/services/structureService';
import { Structure, createDefaultStructure } from '@/lib/models/structureModel';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

export function useStructure(projectId?: string, structureId?: string) {
  const [structure, setStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<Structure | null>(null);
  const lastSavedStructureRef = useRef<string>('');

  useEffect(() => {
    async function loadStructure() {
      setIsLoading(true);
      try {
        if (structureId && structureId !== 'new') {
          // Load structure by ID
          const loadedStructure = await getStructureById(structureId);
          setStructure(loadedStructure);
          if (loadedStructure) {
            // Store initial structure JSON to compare for changes
            lastSavedStructureRef.current = JSON.stringify(loadedStructure);
          }
        } else if (projectId) {
          // Load structure by project ID
          const loadedStructure = await getStructureByProjectId(projectId);
          setStructure(loadedStructure);
          if (loadedStructure) {
            lastSavedStructureRef.current = JSON.stringify(loadedStructure);
          }
        } else if (structureId === 'new') {
          // Create a new structure
          const newStructure = createDefaultStructure();
          newStructure.id = uuidv4();
          setStructure(newStructure);
          lastSavedStructureRef.current = JSON.stringify(newStructure);
        } else {
          // Default empty structure
          const emptyStructure = createDefaultStructure();
          emptyStructure.id = uuidv4();
          setStructure(emptyStructure);
          lastSavedStructureRef.current = JSON.stringify(emptyStructure);
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

  // Cleanup function for any pending save timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Check if structure has changed
  const hasChanged = useCallback((updatedStructure: Structure): boolean => {
    const currentJson = JSON.stringify(updatedStructure);
    return currentJson !== lastSavedStructureRef.current;
  }, []);

  const debouncedSave = useCallback((updatedStructure: Structure) => {
    // Only save if there are actual changes
    if (!hasChanged(updatedStructure)) {
      return;
    }
    
    // Store the latest version we want to save
    pendingSaveRef.current = updatedStructure;
    
    // Clear any pending timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      if (isSaving || !pendingSaveRef.current) return;
      
      try {
        setIsSaving(true);
        const structureToSave = pendingSaveRef.current;
        pendingSaveRef.current = null; // Clear pending save
        
        const saved = await saveStructureToDb(structureToSave);
        setStructure(saved);
        setLastSaved(new Date());
        // Update the last saved reference
        lastSavedStructureRef.current = JSON.stringify(saved);
        
        // Show toast only once per save operation
        toast({
          title: 'Structure saved',
          description: 'Your structure has been saved automatically.',
          duration: 2000,
        });
      } catch (err) {
        console.error('Error saving structure:', err);
        setError(err instanceof Error ? err : new Error('Failed to save structure'));
      } finally {
        setIsSaving(false);
      }
    }, 3000); // 3 second debounce
  }, [isSaving, hasChanged]);

  const saveStructure = async (updatedStructure: Structure) => {
    // Immediate save for explicit save actions (like button clicks)
    if (isSaving) {
      return updatedStructure;
    }
    
    // Don't save if there are no changes
    if (!hasChanged(updatedStructure)) {
      return updatedStructure;
    }
    
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    pendingSaveRef.current = null;
    
    setIsSaving(true);
    try {
      const saved = await saveStructureToDb(updatedStructure);
      setStructure(saved);
      setLastSaved(new Date());
      
      // Update the last saved reference
      lastSavedStructureRef.current = JSON.stringify(saved);
      
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
    debouncedSave(updatedStructure);
  };

  return {
    structure,
    isLoading,
    error,
    isSaving,
    lastSaved,
    saveStructure,
    updateStructure
  };
}
