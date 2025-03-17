
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
    
    // Update the element with the beat ID
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, beatId: beatId } : element
      )
    );
    
    // Find the act type for the selected beat
    let actType: ActType | null = null;
    if (selectedStructure.acts) {
      for (const act of selectedStructure.acts) {
        if (act.id === actId) {
          actType = act.act_type;
          break;
        }
      }
    }
    
    // Add the act tag to the element
    if (actType) {
      const actTag = actType === ActType.ACT_1 ? 'Act 1: Setup' :
                   actType === ActType.ACT_2A ? 'Act 2A: Reaction' :
                   actType === ActType.MIDPOINT ? 'Midpoint: Turning Point' :
                   actType === ActType.ACT_2B ? 'Act 2B: Approach' :
                   'Act 3: Resolution';
                   
      setElements(prevElements =>
        prevElements.map(element => {
          if (element.id === elementId) {
            // Remove any existing act tags
            const filteredTags = (element.tags || []).filter(tag => 
              !tag.startsWith('Act 1:') && 
              !tag.startsWith('Act 2A:') && 
              !tag.startsWith('Midpoint:') && 
              !tag.startsWith('Act 2B:') && 
              !tag.startsWith('Act 3:')
            );
            
            // Add the new act tag
            return { ...element, tags: [...filteredTags, actTag] };
          }
          return element;
        })
      );
    }
    
    // Update the beat completion status
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
