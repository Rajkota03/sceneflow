import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface AltBeatRequest {
  beat_id: number;
  beat_title: string;
  current_summary: string;
  story_type: string;
  conflict_start_id?: number;
}

export interface AltBeatAlternative {
  summary: string;
  source_id: number;
}

export interface AltBeatResponse {
  success: boolean;
  alternatives: AltBeatAlternative[];
  rawResponse?: string;
  error?: string;
}

export const useAltBeatGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAltBeats = async (request: AltBeatRequest): Promise<AltBeatResponse | null> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-alt-beats', {
        body: request
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Alternatives Generated",
          description: `Found ${data.alternatives?.length || 0} alternative beat summaries`
        });
        return data;
      } else {
        throw new Error(data.error || 'Failed to generate alternatives');
      }
    } catch (error) {
      console.error('Error generating alternatives:', error);
      toast({
        title: "Error",
        description: "Failed to generate beat alternatives",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAltBeats,
    isGenerating
  };
};