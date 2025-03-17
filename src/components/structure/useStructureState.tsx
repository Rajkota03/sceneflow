
import { useState, useEffect } from 'react';
import { Structure, Act, Beat } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

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
  
  const resetToDefaultStructure = () => {
    // Create a new structure with the default 3-act structure
    const defaultActs: Act[] = [
      {
        id: uuidv4(),
        title: "Act 1: Setup",
        colorHex: "#3b82f6", // blue
        startPosition: 0,
        endPosition: 25,
        beats: [
          {
            id: uuidv4(),
            title: "Hook",
            description: "The opening moment that sets the tone and grabs attention.",
            timePosition: 2,
            pageRange: "1-3",
            complete: false,
            notes: "Introduces protagonist, world, and theme."
          },
          {
            id: uuidv4(),
            title: "Set-Up",
            description: "Introduce characters, their goals, and the stakes.",
            timePosition: 8,
            pageRange: "4-12",
            complete: false,
            notes: "Establish protagonist's ordinary world. Introduce key relationships and foreshadow conflicts."
          },
          {
            id: uuidv4(),
            title: "Inciting Incident",
            description: "The \"Call to Adventure\"—an event that disrupts the protagonist's world.",
            timePosition: 12,
            pageRange: "13-17",
            complete: false,
            notes: "Shakes up the normal world. Introduces the main conflict."
          },
          {
            id: uuidv4(),
            title: "Build-Up",
            description: "Preparing for the transition into the main conflict.",
            timePosition: 18,
            pageRange: "18-24",
            complete: false,
            notes: "Rising action leads to First Plot Point. Antagonist or external force strengthens."
          },
          {
            id: uuidv4(),
            title: "1st Plot Point",
            description: "Marks the transition from Act 1 to Act 2A.",
            timePosition: 24,
            pageRange: "25-30",
            complete: false,
            notes: "The point of no return."
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Act 2A: Reaction",
        colorHex: "#eab308", // yellow
        startPosition: 25,
        endPosition: 50,
        beats: [
          {
            id: uuidv4(),
            title: "1st Pinch Point",
            description: "A reminder of the antagonist's strength or new information that raises stakes.",
            timePosition: 35,
            pageRange: "35-40",
            complete: false,
            notes: "The protagonist struggles to react."
          },
          {
            id: uuidv4(),
            title: "Midpoint",
            description: "A game-changing revelation shifts the protagonist's perspective.",
            timePosition: 50,
            pageRange: "55-60",
            complete: false,
            notes: "Biggest shift in the protagonist's goal/motivation. False victory or devastating loss."
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Act 2B: Action",
        colorHex: "#f59e0b", // amber
        startPosition: 50,
        endPosition: 75,
        beats: [
          {
            id: uuidv4(),
            title: "2nd Pinch Point",
            description: "A foreshadowing event that reinforces what's at stake.",
            timePosition: 65,
            pageRange: "65-70",
            complete: false,
            notes: "Antagonist strengthens or executes a major move."
          },
          {
            id: uuidv4(),
            title: "Renewed Push",
            description: "The protagonist starts taking charge and moving toward the final battle.",
            timePosition: 72,
            pageRange: "75-85",
            complete: false,
            notes: "Shifts from reaction to action."
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Act 3: Resolution",
        colorHex: "#ef4444", // red
        startPosition: 75,
        endPosition: 100,
        beats: [
          {
            id: uuidv4(),
            title: "3rd Plot Point",
            description: "A dark moment—the protagonist faces a major loss or setback.",
            timePosition: 78,
            pageRange: "90-95",
            complete: false,
            notes: "The antagonist gains the upper hand."
          },
          {
            id: uuidv4(),
            title: "Climax",
            description: "The final confrontation—the protagonist vs. antagonist.",
            timePosition: 90,
            pageRange: "105-110",
            complete: false,
            notes: "Protagonist fully transforms and takes decisive action."
          },
          {
            id: uuidv4(),
            title: "Resolution",
            description: "The final moments—tying up loose ends and leaving an emotional impact.",
            timePosition: 95,
            pageRange: "110-120",
            complete: false,
            notes: "Shows the protagonist's changed world."
          }
        ]
      }
    ];

    // Update with default structure
    const updatedStructure = {
      ...localStructure,
      acts: defaultActs
    };
    
    setLocalStructure(updatedStructure);
    setHasChanges(true);
    
    // Open all acts
    const allOpen: Record<string, boolean> = {};
    defaultActs.forEach(act => {
      allOpen[act.id] = true;
    });
    setExpandedActs(allOpen);
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
    resetToDefaultStructure,
    setIsEditing,
    cancelEditing
  };
};
