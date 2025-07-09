import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Beat40 {
  id: number;
  title: string;
  type: string;
  summary: string;
  source_id?: number;
  alternatives?: Array<{
    summary: string;
    source_id: number;
  }>;
}

interface RegenerateParams {
  beats: Beat40[];
  changedIndex: number;
  model: string;
}

export function useDownstreamRegeneration() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const regenerateDownstream = async ({ beats, changedIndex, model }: RegenerateParams) => {
    setIsRegenerating(true);
    
    try {
      console.log('Starting downstream regeneration...', { changedIndex, model });
      
      const { data, error } = await supabase.functions.invoke('regenerate-downstream-beats', {
        body: {
          beats_json: beats,
          changed_index: changedIndex,
          model: model,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data || !data.beats) {
        throw new Error('No beats returned from regeneration');
      }

      console.log('Regeneration completed:', data);
      
      toast({
        title: "Beats Regenerated",
        description: `Successfully updated ${data.regenerated_count || 'downstream'} beats to maintain story consistency.`,
      });

      return data.beats;
    } catch (error) {
      console.error('Error regenerating downstream beats:', error);
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Failed to regenerate downstream beats. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    regenerateDownstream,
    isRegenerating,
  };
}