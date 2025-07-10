import { useState } from 'react';
import { useAltBeatGeneration } from './useAltBeatGeneration';
import { toast } from '@/components/ui/use-toast';

interface Beat40 {
  id: number;
  title: string;
  type: string;
  summary: string;
  source_id?: number;
  alternatives: Array<{
    summary: string;
    source_id: number;
  }>;
}

export const useAutoGenerateAlternatives = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateAltBeats } = useAltBeatGeneration();

  const generateAlternativesForFirstBeats = async (
    beats: Beat40[], 
    count: number = 5
  ): Promise<Beat40[]> => {
    if (!beats || beats.length === 0) return beats;
    
    setIsGenerating(true);
    const updatedBeats = [...beats];
    const beatsToProcess = beats.slice(0, Math.min(count, beats.length));
    
    try {
      toast({
        title: "Auto-Generating Alternatives",
        description: `Generating alternatives for the first ${beatsToProcess.length} beats to demonstrate the feature...`
      });

      // Process beats sequentially to avoid overwhelming the API
      for (const beat of beatsToProcess) {
        try {
          const result = await generateAltBeats({
            beat_id: beat.id,
            beat_title: beat.title,
            current_summary: beat.summary,
            story_type: beat.type,
          });

          if (result?.alternatives) {
            const beatIndex = updatedBeats.findIndex(b => b.id === beat.id);
            if (beatIndex !== -1) {
              updatedBeats[beatIndex] = {
                ...updatedBeats[beatIndex],
                alternatives: result.alternatives
              };
            }
          }
        } catch (error) {
          console.error(`Failed to generate alternatives for beat ${beat.id}:`, error);
          // Continue with other beats even if one fails
        }
      }

      const successfulCount = updatedBeats.slice(0, count).filter(beat => beat.alternatives.length > 0).length;
      
      if (successfulCount > 0) {
        toast({
          title: "Auto-Generation Complete",
          description: `Generated alternatives for ${successfulCount} beats! Click any beat to explore alternatives.`
        });
      }

      return updatedBeats;
    } catch (error) {
      console.error('Error in auto-generating alternatives:', error);
      toast({
        title: "Auto-Generation Failed",
        description: "Some alternatives couldn't be generated. You can manually generate them by clicking on beats.",
        variant: "destructive"
      });
      return updatedBeats;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAlternativesForFirstBeats,
    isGenerating
  };
};