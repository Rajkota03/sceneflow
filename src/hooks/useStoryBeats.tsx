
import { toast } from '@/components/ui/use-toast';
import { ThreeActStructure, StoryBeat } from '@/lib/types';

export const useStoryBeats = (
  structure: ThreeActStructure | null,
  saveStructure: (updatedStructure: ThreeActStructure) => void
) => {
  // We keep the function but it won't be exposed
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
  
  const handleUpdateBeat = (beatId: string, updates: Partial<StoryBeat>) => {
    if (!structure) {
      console.error('Cannot update beat: structure is null');
      return;
    }
    
    console.log('Updating beat:', beatId, updates);
    console.log('Current structure:', structure);
    
    // Find the beat to update
    const beatToUpdate = structure.beats.find(beat => beat.id === beatId);
    if (!beatToUpdate) {
      console.error(`Beat with id ${beatId} not found in structure`);
      return;
    }
    
    console.log('Found beat to update:', beatToUpdate);
    
    // Find and update the specified beat
    const updatedBeats = structure.beats.map(beat => 
      beat.id === beatId ? { ...beat, ...updates } : beat
    );
    
    console.log('Updated beats array:', updatedBeats);
    
    // Create updated structure
    const updatedStructure = {
      ...structure,
      beats: updatedBeats,
      updatedAt: new Date()
    };
    
    console.log('Updated structure for save:', updatedStructure);
    
    // Save the updated structure
    saveStructure(updatedStructure);
    
    toast({
      title: 'Beat updated',
      description: 'Your story beat has been updated successfully',
    });
  };
  
  return {
    handleUpdateBeat
    // We don't expose handleDeleteBeat anymore
  };
};

export default useStoryBeats;
