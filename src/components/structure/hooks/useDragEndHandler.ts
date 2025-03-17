
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Structure } from '@/lib/models/structureModel';
import { useCallback } from 'react';

export function useDragEndHandler(
  structure: Structure, 
  onChange: (updatedStructure: Structure) => void
) {
  return useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);
      
      // Extract actId and beatId from the combined id (actId|beatId)
      const [activeActId, activeBeatId] = activeId.split('|');
      const [overActId, overBeatId] = overId.split('|');
      
      // Only allow sorting within the same act
      if (activeActId === overActId) {
        const act = structure.acts.find(a => a.id === activeActId);
        
        if (!act) return;
        
        const oldIndex = act.beats.findIndex(beat => beat.id === activeBeatId);
        const newIndex = act.beats.findIndex(beat => beat.id === overBeatId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newBeats = arrayMove(act.beats, oldIndex, newIndex);
          
          onChange({
            ...structure,
            acts: structure.acts.map(a => 
              a.id === activeActId 
                ? { ...a, beats: newBeats }
                : a
            ),
          });
        }
      }
    }
  }, [structure, onChange]);
}
