
import { useState, useEffect } from 'react';
import { Structure, Act, Beat } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface UseStructureStateProps {
  structure: Structure;
  onStructureUpdate?: (updatedStructure: Structure) => Promise<void>;
}

export const useStructureState = ({ structure, onStructureUpdate }: UseStructureStateProps) => {
  const [expandedActs, setExpandedActs] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [localStructure, setLocalStructure] = useState<Structure>(structure);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    // Initialize with all acts expanded
    const initialExpandedState: Record<string, boolean> = {};
    structure.acts.forEach(act => {
      initialExpandedState[act.id] = true;
    });
    setExpandedActs(initialExpandedState);
  }, [structure.acts]);

  useEffect(() => {
    // Reset local structure when the prop changes
    setLocalStructure(structure);
    setHasChanges(false);
  }, [structure]);
  
  const toggleAct = (actId: string) => {
    setExpandedActs(prev => ({
      ...prev,
      [actId]: !prev[actId]
    }));
  };
  
  // Calculate overall progress
  const calculateProgress = () => {
    const totalBeats = localStructure.acts.reduce((sum, act) => sum + act.beats.length, 0);
    const completeBeats = localStructure.acts.reduce((sum, act) => 
      sum + act.beats.filter(beat => beat.complete).length, 0);
    return totalBeats > 0 ? (completeBeats / totalBeats) * 100 : 0;
  };

  const progressPercentage = calculateProgress();
  
  const handleBeatsReorder = (actId: string, reorderedBeats: Beat[]) => {
    const updatedActs = localStructure.acts.map(act => 
      act.id === actId ? { ...act, beats: reorderedBeats } : act
    );
    
    setLocalStructure({
      ...localStructure,
      acts: updatedActs
    });
    setHasChanges(true);
  };
  
  const handleBeatUpdate = (actId: string, beatId: string, updatedBeatFields: Partial<Beat>) => {
    const updatedActs = localStructure.acts.map(act => {
      if (act.id === actId) {
        const updatedBeats = act.beats.map(beat => 
          beat.id === beatId ? { ...beat, ...updatedBeatFields } : beat
        );
        return { ...act, beats: updatedBeats };
      }
      return act;
    });
    
    setLocalStructure({
      ...localStructure,
      acts: updatedActs
    });
    setHasChanges(true);
  };
  
  const handleBeatToggleComplete = (actId: string, beatId: string, complete: boolean) => {
    handleBeatUpdate(actId, beatId, { complete });
  };
  
  const handleSaveStructure = async () => {
    if (!onStructureUpdate) {
      toast({
        title: "Cannot save structure",
        description: "Save function not provided. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await onStructureUpdate(localStructure);
      toast({
        title: "Success",
        description: "Structure saved successfully"
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving structure:", error);
      toast({
        title: "Error",
        description: "Failed to save structure",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setLocalStructure(structure); // Reset to original structure
    setHasChanges(false);
  };

  return {
    expandedActs,
    isEditing,
    localStructure,
    isSaving,
    hasChanges,
    progressPercentage,
    toggleAct,
    handleBeatsReorder,
    handleBeatUpdate,
    handleBeatToggleComplete,
    handleSaveStructure,
    setIsEditing,
    cancelEditing
  };
};
