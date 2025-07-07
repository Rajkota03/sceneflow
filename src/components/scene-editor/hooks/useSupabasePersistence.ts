import { useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabasePersistence = (editor: Editor | null, scriptId: string) => {
  // Debounced save function with basic debounce
  const debouncedSave = useCallback((content: any) => {
    const timeoutId = setTimeout(async () => {
      if (!scriptId) return;
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('scenes')
          .upsert({
            id: scriptId,
            project_id: scriptId, // Using scriptId as project_id for now
            content_richtext: content,
            author_id: user.id,
            updated_at: new Date().toISOString(),
          });
          
        if (error) {
          console.error('Error saving scene:', error);
        }
      } catch (err) {
        console.error('Error saving scene:', err);
      }
    }, 1000);
  }, [scriptId]);

  // Load initial content
  const loadContent = useCallback(async () => {
    if (!scriptId || !editor) return;
    
    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('content_richtext')
        .eq('id', scriptId)
        .single();
        
      if (error) {
        console.error('Error loading scene:', error);
        return;
      }
      
      if (data?.content_richtext) {
        editor.commands.setContent(data.content_richtext as any);
      }
    } catch (err) {
      console.error('Error loading scene:', err);
    }
  }, [scriptId, editor]);

  // Set up editor update listener
  useEffect(() => {
    if (!editor) return;
    
    const handleUpdate = () => {
      const json = editor.getJSON();
      debouncedSave(json);
    };
    
    editor.on('update', handleUpdate);
    
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, debouncedSave]);

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return { loadContent };
};