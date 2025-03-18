
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
  
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    structure.acts.forEach(act => {
      initialExpandedState[act.id] = true;
    });
    setExpandedActs(initialExpandedState);
  }, [structure.acts]);

  useEffect(() => {
    setLocalStructure(structure);
    setHasChanges(false);
  }, [structure]);
  
  const toggleAct = (actId: string) => {
    setExpandedActs(prev => ({
      ...prev,
      [actId]: !prev[actId]
    }));
  };
  
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
    
    // Preserve the structure name
    updatedStructure.name = localStructure.name;
    
    setLocalStructure(updatedStructure);
    setHasChanges(true);
    
    const allOpen: Record<string, boolean> = {};
    updatedStructure.acts.forEach(act => {
      allOpen[act.id] = true;
    });
    setExpandedActs(allOpen);
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
    cancelEditing
  };
};
