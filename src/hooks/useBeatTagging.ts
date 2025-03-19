
import { useState, useEffect } from 'react';
import { Structure, ScriptElement, BeatSceneCount } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface UseBeatTaggingProps {
  elements: ScriptElement[];
  setElements: React.Dispatch<React.SetStateAction<ScriptElement[]>>;
  selectedStructure?: Structure | null;
}

export const useBeatTagging = ({ 
  elements, 
  setElements, 
  selectedStructure 
}: UseBeatTaggingProps) => {
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [beatSceneCounts, setBeatSceneCounts] = useState<BeatSceneCount[]>([]);

  const handleBeatTag = (elementId: string, beatId: string, actId: string) => {
    console.log('handleBeatTag called:', { elementId, beatId, actId });
    
    const elementToUpdate = elements.find(el => el.id === elementId);
    if (!elementToUpdate) {
      console.error('Element not found:', elementId);
      return;
    }
    
    // Update the beat ID in the element
    const updatedElements = elements.map(element =>
      element.id === elementId 
        ? { ...element, beat: beatId } 
        : element
    );
    
    // Update elements state
    setElements(updatedElements);
    
    // Show success toast
    toast({
      description: beatId ? "Scene tagged successfully" : "Beat tag removed",
      duration: 2000,
    });
    
    // Immediately update counts after tagging
    updateBeatSceneCounts(updatedElements);
  };

  const updateBeatSceneCounts = (currentElements = elements) => {
    if (!selectedStructure) return;
    
    const counts: BeatSceneCount[] = [];
    
    const getActs = () => {
      if (!selectedStructure) return [];
      
      if (Array.isArray(selectedStructure.acts)) {
        return selectedStructure.acts;
      } 
      
      if (selectedStructure.acts && typeof selectedStructure.acts === 'object') {
        const actsObj = selectedStructure.acts as { acts?: any };
        if (actsObj.acts && Array.isArray(actsObj.acts)) {
          return actsObj.acts;
        }
      }
      
      return [];
    };
    
    const acts = getActs();
    
    acts.forEach(act => {
      if (!act.beats || !Array.isArray(act.beats)) return;
      
      act.beats.forEach(beat => {
        const taggedScenes = currentElements.filter(
          element => element.type === 'scene-heading' && element.beat === beat.id
        );
        
        let minPage = Infinity;
        let maxPage = 0;
        
        taggedScenes.forEach(scene => {
          if (scene.page) {
            minPage = Math.min(minPage, scene.page);
            maxPage = Math.max(maxPage, scene.page);
          }
        });
        
        const pageRange = taggedScenes.length > 0 
          ? (minPage === maxPage ? `p.${minPage}` : `pp.${minPage}-${maxPage}`)
          : '';
        
        counts.push({
          beatId: beat.id,
          actId: act.id,
          count: taggedScenes.length,
          pageRange
        });
      });
    });
    
    setBeatSceneCounts(counts);
  };

  const updatePageNumbers = () => {
    // Assign estimated page numbers to elements
    const updatedElements = elements.map((element, index) => {
      const estimatedPage = Math.floor(index / 15) + 1; // Simple estimation - 15 elements per page
      return { ...element, page: estimatedPage };
    });
    
    setElements(updatedElements);
    updateBeatSceneCounts(updatedElements);
  };

  // Update scene counts whenever elements or structure changes
  useEffect(() => {
    updatePageNumbers();
  }, [elements.length, selectedStructure]);

  return {
    activeBeatId,
    setActiveBeatId,
    beatSceneCounts,
    handleBeatTag,
    updateBeatSceneCounts,
    updatePageNumbers
  };
};

export default useBeatTagging;
