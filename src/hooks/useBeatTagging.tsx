
import { useState } from 'react';
import { ScriptElement, ActType, Structure } from '@/types/scriptTypes';
import { toast } from '@/components/ui/use-toast';

export function useBeatTagging(
  elements: ScriptElement[],
  setElements: React.Dispatch<React.SetStateAction<ScriptElement[]>>,
  selectedStructure: Structure | null | undefined,
  selectedStructureId: string | undefined,
  updateBeatCompletion: (beatId: string, actId: string, completed: boolean) => any,
  saveBeatCompletion: (structureId: string, updatedStructure: any) => Promise<boolean>
) {
  const handleBeatTag = async (elementId: string, beatId: string, actId: string) => {
    if (!selectedStructure || !selectedStructureId) return;
    
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, beatId: beatId } : element
      )
    );
    
    const updatedStructure = updateBeatCompletion(beatId, actId, true);
    if (updatedStructure) {
      const success = await saveBeatCompletion(selectedStructureId, updatedStructure);
      if (success) {
        toast({
          title: "Beat tagged",
          description: "The scene has been tagged and structure progress updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update the structure progress.",
          variant: "destructive",
        });
      }
    }
  };

  return { handleBeatTag };
}
