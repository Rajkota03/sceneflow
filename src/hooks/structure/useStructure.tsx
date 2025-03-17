
import { useState, useEffect, useCallback, useRef } from 'react';
import { Structure } from '@/lib/models/structureModel';
import { toast } from '@/components/ui/use-toast';
import { 
  loadStructureById, 
  loadStructureByProjectId, 
  createNewStructure,
  saveStructureWithUpdatedTimestamps
} from './structureUtils';
import { UseStructureResult } from './structureTypes';

export function useStructure(projectId?: string, structureId?: string): UseStructureResult {
  const [structure, setStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<Structure | null>(null);
  const lastSavedStructureRef = useRef<string>('');
  const initialLoadCompleted = useRef<boolean>(false);

  useEffect(() => {
    async function loadStructure() {
      setIsLoading(true);
      try {
        let loadedStructure: Structure | null = null;
        
        if (structureId === 'new') {
          // Create a new structure immediately for /new route
          loadedStructure = createNewStructure(projectId || undefined);
          console.log('Created new structure for /new route:', loadedStructure.id);
        } else if (structureId) {
          // Load structure by ID
          loadedStructure = await loadStructureById(structureId);
        } else if (projectId) {
          // Load structure by project ID
          loadedStructure = await loadStructureByProjectId(projectId);
        } else {
          // Default empty structure if no ids provided
          console.log('Creating empty structure as fallback');
          loadedStructure = createNewStructure();
        }
        
        setStructure(loadedStructure);
        if (loadedStructure) {
          // Store initial structure JSON to compare for changes
          lastSavedStructureRef.current = JSON.stringify(loadedStructure);
        }
      } catch (err) {
        console.error('Error loading structure:', err);
        setError(err instanceof Error ? err : new Error('Failed to load structure'));
        
        // For /new route, we should still provide a default structure even if loading fails
        if (structureId === 'new') {
          const newStructure = createNewStructure(projectId || undefined);
          setStructure(newStructure);
          lastSavedStructureRef.current = JSON.stringify(newStructure);
          setError(null); // Clear error since we have a fallback
        } else {
          toast({
            title: 'Error loading structure',
            description: 'Please check your connection and try again.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
        initialLoadCompleted.current = true;
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
      console.log('No changes detected, skipping save');
      return Promise.resolve(updatedStructure);
    }
    
    // Store the latest version we want to save
    pendingSaveRef.current = updatedStructure;
    
    // Clear any pending timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    return new Promise<Structure>((resolve) => {
      // Set a new timeout
      saveTimeoutRef.current = setTimeout(async () => {
        if (isSaving || !pendingSaveRef.current) {
          resolve(updatedStructure);
          return;
        }
        
        try {
          setIsSaving(true);
          const structureToSave = pendingSaveRef.current;
          pendingSaveRef.current = null; // Clear pending save
          
          const saved = await saveStructureWithUpdatedTimestamps(structureToSave);
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
          
          resolve(saved);
        } catch (err) {
          console.error('Error auto-saving structure:', err);
          setError(err instanceof Error ? err : new Error('Failed to save structure'));
          resolve(updatedStructure);
        } finally {
          setIsSaving(false);
        }
      }, 2000); // 2 second debounce
    });
  }, [isSaving, hasChanged]);

  const saveStructure = async (updatedStructure: Structure) => {
    // Immediate save for explicit save actions (like button clicks)
    if (isSaving) {
      console.log('Save already in progress, ignoring request');
      return updatedStructure;
    }
    
    // Don't save if there are no changes (except for new structures)
    if (!updatedStructure.id.includes('-') || !hasChanged(updatedStructure)) {
      console.log('No changes detected or this is a new structure, proceeding with save');
    }
    
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    pendingSaveRef.current = null;
    
    setIsSaving(true);
    try {
      const saved = await saveStructureWithUpdatedTimestamps(updatedStructure, true);
      setStructure(saved);
      setLastSaved(new Date());
      
      // Update the last saved reference
      lastSavedStructureRef.current = JSON.stringify(saved);
      
      return saved;
    } catch (err) {
      console.error('Error manually saving structure:', err);
      setError(err instanceof Error ? err : new Error('Failed to save structure'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updateStructure = (updatedStructure: Structure) => {
    setStructure(updatedStructure);
    return debouncedSave(updatedStructure);
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
