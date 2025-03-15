
import { toast } from '@/components/ui/use-toast';
import { ThreeActStructure, StoryBeat, ActType } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export const useStoryBeats = (
  structure: ThreeActStructure | null,
  saveStructure: (updatedStructure: ThreeActStructure) => void
) => {
  const handleDeleteBeat = (beatId: string) => {
    if (!structure) return;
    
    // Filter out the beat with the specified ID
    const updatedBeats = structure.beats.filter(beat => beat.id !== beatId);
    
    // Update positions to ensure they're consecutive
    const reorderedBeats = updatedBeats.map((beat, index) => ({
      ...beat,
      position: index
    }));
    
    // Create updated structure
    const updatedStructure = {
      ...structure,
      beats: reorderedBeats,
      updatedAt: new Date()
    };
    
    // Save the updated structure
    saveStructure(updatedStructure);
    
    toast({
      title: 'Beat deleted',
      description: 'The story beat has been removed from the structure',
    });
  };
  
  const handleAddBeat = (actNumber: ActType) => {
    if (!structure) return;
    
    // Calculate the position for the new beat
    const actBeats = structure.beats.filter(beat => beat.actNumber === actNumber);
    const position = actBeats.length > 0 
      ? Math.max(...actBeats.map(beat => beat.position)) + 1 
      : structure.beats.length;
    
    // Create a new beat
    const newBeat: StoryBeat = {
      id: `beat-${uuidv4()}`,
      title: `New Beat`,
      description: 'Add your beat description here',
      position: position,
      actNumber: actNumber,
      isMidpoint: actNumber === 'midpoint'
    };
    
    // Add the new beat to the structure
    const updatedStructure = {
      ...structure,
      beats: [...structure.beats, newBeat],
      updatedAt: new Date()
    };
    
    // Save the updated structure
    saveStructure(updatedStructure);
    
    toast({
      title: 'Beat Added',
      description: `New beat added to ${actNumber === 'midpoint' ? 'Midpoint' : `Act ${actNumber}`}`,
    });
    
    return newBeat;
  };
  
  return {
    handleDeleteBeat,
    handleAddBeat
  };
};

export default useStoryBeats;
