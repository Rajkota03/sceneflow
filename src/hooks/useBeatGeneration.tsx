import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';

export interface BeatGeneration {
  id: string;
  title: string;
  genre: string;
  theme: string;
  structure_type: string;
  custom_prompt?: string;
  generated_beats: any;
  created_at: string;
  updated_at: string;
}

export interface BeatTemplate {
  id: string;
  name: string;
  description?: string;
  genre: string;
  theme: string;
  structure_type: string;
  custom_prompt?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface BeatGenerationRequest {
  title: string;
  genre: string;
  theme: string;
  structure_type: string;
  custom_prompt?: string;
}

export const useBeatGeneration = () => {
  const { session } = useAuth();
  const [generations, setGenerations] = useState<BeatGeneration[]>([]);
  const [templates, setTemplates] = useState<BeatTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchGenerations = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('beat_generations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error fetching beat generations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch beat generations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('beat_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching beat templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch beat templates",
        variant: "destructive"
      });
    }
  };

  const generateBeats = async (request: BeatGenerationRequest) => {
    if (!session) return null;

    setIsGenerating(true);
    try {
      // Get the selected structure
      const actStructure = getStructureByType(request.structure_type);
      
      const { data, error } = await supabase.functions.invoke('generate-beats', {
        body: {
          genre: request.genre,
          theme: request.theme,
          actStructure,
          customPrompt: request.custom_prompt
        }
      });

      if (error) throw error;

      if (data.success) {
        // Save the generation to database
        const { data: savedGeneration, error: saveError } = await supabase
          .from('beat_generations')
          .insert({
            user_id: session.user.id,
            title: request.title,
            genre: request.genre,
            theme: request.theme,
            structure_type: request.structure_type,
            custom_prompt: request.custom_prompt,
            generated_beats: data.beats
          })
          .select()
          .single();

        if (saveError) throw saveError;

        setGenerations(prev => [savedGeneration, ...prev]);
        
        toast({
          title: "Success",
          description: "Story beats generated successfully!"
        });

        return savedGeneration;
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating beats:', error);
      toast({
        title: "Error",
        description: "Failed to generate story beats",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsTemplate = async (generation: BeatGeneration, templateName: string, description?: string) => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('beat_templates')
        .insert({
          user_id: session.user.id,
          name: templateName,
          description,
          genre: generation.genre,
          theme: generation.theme,
          structure_type: generation.structure_type,
          custom_prompt: generation.custom_prompt
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Template saved successfully!"
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const deleteGeneration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('beat_generations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGenerations(prev => prev.filter(g => g.id !== id));
      
      toast({
        title: "Success",
        description: "Generation deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting generation:', error);
      toast({
        title: "Error",
        description: "Failed to delete generation",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('beat_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Success",
        description: "Template deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const exportBeats = (generation: BeatGeneration, format: 'json' | 'txt') => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(generation.generated_beats, null, 2);
        filename = `${generation.title.replace(/\s+/g, '_')}_beats.json`;
        mimeType = 'application/json';
      } else {
        // Convert beats to readable text format
        content = formatBeatsAsText(generation);
        filename = `${generation.title.replace(/\s+/g, '_')}_beats.txt`;
        mimeType = 'text/plain';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Beats exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Error exporting beats:', error);
      toast({
        title: "Error",
        description: "Failed to export beats",
        variant: "destructive"
      });
    }
  };

  const formatBeatsAsText = (generation: BeatGeneration): string => {
    let text = `${generation.title}\n`;
    text += `Genre: ${generation.genre}\n`;
    text += `Theme: ${generation.theme}\n`;
    text += `Structure: ${generation.structure_type}\n\n`;

    if (generation.generated_beats.acts) {
      generation.generated_beats.acts.forEach((act: any, actIndex: number) => {
        text += `ACT ${actIndex + 1}: ${act.title}\n`;
        text += `${'='.repeat(40)}\n\n`;
        
        if (act.beats) {
          act.beats.forEach((beat: any, beatIndex: number) => {
            text += `Beat ${beatIndex + 1}: ${beat.title}\n`;
            text += `${'-'.repeat(20)}\n`;
            text += `${beat.description}\n`;
            if (beat.pageRange) text += `Pages: ${beat.pageRange}\n`;
            text += '\n';
          });
        }
        text += '\n';
      });
    }

    return text;
  };

  const getStructureByType = (type: string) => {
    const structures = {
      'three_act': {
        name: 'Three Act Structure',
        acts: [
          { title: 'Act I - Setup', startPosition: 0, endPosition: 25 },
          { title: 'Act II - Confrontation', startPosition: 25, endPosition: 75 },
          { title: 'Act III - Resolution', startPosition: 75, endPosition: 100 }
        ]
      },
      'save_the_cat': {
        name: 'Save the Cat Beat Sheet',
        acts: [
          { title: 'Opening Image', startPosition: 0, endPosition: 5 },
          { title: 'Setup', startPosition: 5, endPosition: 25 },
          { title: 'Inciting Incident', startPosition: 25, endPosition: 50 },
          { title: 'Midpoint', startPosition: 50, endPosition: 75 },
          { title: 'Finale', startPosition: 75, endPosition: 100 }
        ]
      },
      'hero_journey': {
        name: "Hero's Journey",
        acts: [
          { title: 'Ordinary World', startPosition: 0, endPosition: 20 },
          { title: 'Call to Adventure', startPosition: 20, endPosition: 40 },
          { title: 'Trials and Tribulations', startPosition: 40, endPosition: 80 },
          { title: 'Return', startPosition: 80, endPosition: 100 }
        ]
      }
    };
    
    return structures[type as keyof typeof structures] || structures.three_act;
  };

  useEffect(() => {
    if (session) {
      fetchGenerations();
      fetchTemplates();
    }
  }, [session]);

  return {
    generations,
    templates,
    isLoading,
    isGenerating,
    generateBeats,
    saveAsTemplate,
    deleteGeneration,
    deleteTemplate,
    exportBeats,
    fetchGenerations,
    fetchTemplates
  };
};