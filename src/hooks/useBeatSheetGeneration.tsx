import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface BeatSheetRequest {
  genre: string;
  logline: string;
  characters?: string;
}

export interface BeatSheetResponse {
  success: boolean;
  beatSheet?: string;
  masterplotUsed?: {
    id: string;
    story_type: string;
  };
  error?: string;
}

export const useBeatSheetGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBeatSheet = async (request: BeatSheetRequest): Promise<BeatSheetResponse | null> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-beat-sheet', {
        body: request
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Beat sheet generated successfully!"
        });
        return data;
      } else {
        throw new Error(data.error || 'Failed to generate beat sheet');
      }
    } catch (error) {
      console.error('Error generating beat sheet:', error);
      toast({
        title: "Error",
        description: "Failed to generate beat sheet",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateBeatSheet,
    isGenerating
  };
};