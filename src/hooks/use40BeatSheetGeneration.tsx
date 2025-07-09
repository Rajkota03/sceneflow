import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Beat40Request {
  genre: string;
  logline: string;
  characters?: string;
  model?: string;
}

export interface Beat40Alternative {
  summary: string;
  source_id: number;
}

export interface Beat40 {
  id: number;
  title: string;
  type: string;
  summary: string;
  alternatives: Beat40Alternative[];
}

export interface Beat40Response {
  success: boolean;
  beats?: {
    beats: Beat40[];
  };
  masterplotUsed?: {
    id: string;
    story_type: string;
  };
  rawResponse?: string;
  error?: string;
}

export const use40BeatSheetGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate40BeatSheet = async (request: Beat40Request): Promise<Beat40Response | null> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-40-beat-sheet', {
        body: request
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "40-beat sheet generated successfully!"
        });
        return data;
      } else {
        throw new Error(data.error || 'Failed to generate 40-beat sheet');
      }
    } catch (error) {
      console.error('Error generating 40-beat sheet:', error);
      toast({
        title: "Error",
        description: "Failed to generate 40-beat sheet",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generate40BeatSheet,
    isGenerating
  };
};