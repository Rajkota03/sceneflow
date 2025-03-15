
import { toast } from '@/components/ui/use-toast';
import { ThreeActStructure, StoryBeat } from '@/lib/types';

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
  
  return {
    handleDeleteBeat
  };
};

export default useStoryBeats;
