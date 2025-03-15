
import { StoryBeat, ThreeActStructure } from '@/lib/types';

/**
 * Creates an updated structure with a modified beat
 */
export const createUpdatedStructureWithBeat = (
  structure: ThreeActStructure,
  beatId: string,
  updates: Partial<StoryBeat>
): ThreeActStructure => {
  // Ensure beats array exists
  const beats = structure.beats || [];
  
  const updatedBeats = beats.map(beat => 
    beat.id === beatId ? { ...beat, ...updates } : beat
  );
  
  return {
    ...structure,
    beats: updatedBeats,
    updatedAt: new Date()
  };
};

/**
 * Creates an updated structure with reordered beats
 */
export const createUpdatedStructureWithReorderedBeats = (
  structure: ThreeActStructure,
  beats: StoryBeat[]
): ThreeActStructure => {
  // Update positions based on new order
  const updatedBeats = beats.map((beat, index) => ({
    ...beat,
    position: index
  }));
  
  return {
    ...structure,
    beats: updatedBeats,
    updatedAt: new Date()
  };
};
