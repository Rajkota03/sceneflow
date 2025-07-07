import { useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash-es';

export const useSupabasePersistence = (editor: Editor | null, scriptId: string) => {
  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (content: any) => {
      if (!scriptId) return;
      
      try {
        const { error } = await supabase
          .from('scenes')
          .upsert({
            id: scriptId,
            content_richtext: content,
            updated_at: new Date().toISOString(),
          });
          
        if (error) {
          console.error('Error saving scene:', error);
        }
      } catch (err) {
        console.error('Error saving scene:', err);
      }
    }, 1000),
    [scriptId]
  );

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
        editor.commands.setContent(data.content_richtext);
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