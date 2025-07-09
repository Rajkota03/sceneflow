
import { useState, useEffect } from 'react';
import { Structure, Act, Beat } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  createThreeActStructure, 
  createSaveTheCatStructure, 
  createHeroJourneyStructure, 
  createStoryCircleStructure 
} from '@/lib/structureTemplates';

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
  
  // This effect will run when the structure prop changes (e.g., when a new structure is selected)
  useEffect(() => {
    console.log("Structure changed in useStructureState", structure.id);
    
    // Create a deep copy to avoid reference issues
    const structureCopy = JSON.parse(JSON.stringify(structure));
    setLocalStructure(structureCopy);
    setHasChanges(false);
    
    // Reset expanded acts when structure changes
    const initialExpandedState: Record<string, boolean> = {};
    
    if (structure.acts && Array.isArray(structure.acts)) {
      structure.acts.forEach(act => {
        if (act && act.id) {
          initialExpandedState[act.id] = true;
        }
      });
    }
    
    setExpandedActs(initialExpandedState);
  }, [structure]);
  
  const toggleAct = (actId: string) => {
    setExpandedActs(prev => ({
      ...prev,
      [actId]: !prev[actId]
    }));
  };
  
  const calculateProgress = () => {
    if (!localStructure.acts || !Array.isArray(localStructure.acts)) {
      return 0;
    }
    
    const totalBeats = localStructure.acts.reduce((sum, act) => {
      if (act && act.beats && Array.isArray(act.beats)) {
        return sum + act.beats.length;
      }
      return sum;
    }, 0);
    
    const completeBeats = localStructure.acts.reduce((sum, act) => {
      if (act && act.beats && Array.isArray(act.beats)) {
        return sum + act.beats.filter(beat => beat.complete).length;
      }
      return sum;
    }, 0);
    
    return totalBeats > 0 ? (completeBeats / totalBeats) * 100 : 0;
  };

  const progressPercentage = calculateProgress();
  
  const handleBeatsReorder = (actId: string, reorderedBeats: Beat[]) => {
    if (!localStructure.acts || !Array.isArray(localStructure.acts)) {
      console.error("No valid acts array found in structure");
      return;
    }
    
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
    if (!localStructure.acts || !Array.isArray(localStructure.acts)) {
      console.error("No valid acts array found in structure");
      return;
    }
    
    const updatedActs = localStructure.acts.map(act => {
      if (act.id === actId && act.beats && Array.isArray(act.beats)) {
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
  
  const resetToDefaultStructure = () => {
    // Reset based on structure type
    let updatedStructure: Structure;
    
    switch (localStructure.structure_type) {
      case 'save_the_cat':
        updatedStructure = createSaveTheCatStructure(localStructure.id);
        break;
      case 'hero_journey':
        updatedStructure = createHeroJourneyStructure(localStructure.id);
        break;
      case 'story_circle':
        updatedStructure = createStoryCircleStructure(localStructure.id);
        break;
      case 'three_act':
      default:
        updatedStructure = createThreeActStructure(localStructure.id);
        break;
    }
    
    // Preserve the structure name and description
    updatedStructure.name = localStructure.name;
    if (localStructure.description) {
      updatedStructure.description = localStructure.description;
    }
    
    setLocalStructure(updatedStructure);
    setHasChanges(true);
    
    const allOpen: Record<string, boolean> = {};
    updatedStructure.acts.forEach(act => {
      allOpen[act.id] = true;
    });
    setExpandedActs(allOpen);
    
    toast({
      title: "Structure Reset",
      description: "The structure has been reset to the default template."
    });
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setLocalStructure(structure);
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
    resetToDefaultStructure,
    setIsEditing,
    cancelEditing,
    setLocalStructure,
    setHasChanges
  };
};
