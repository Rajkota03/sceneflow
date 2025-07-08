import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { History } from '@tiptap/extension-history';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/lib/utils/debounce';
import {
  SceneHeadingNode,
  ActionNode,
  CharacterNode,
  DialogueNode,
  ParentheticalNode,
  TransitionNode,
} from './nodes';
import { PlaceholderSuggestionsExtension } from './extensions/PlaceholderSuggestions';
import { ScreenplayShortcuts } from './extensions/ScreenplayShortcuts';
import { SceneHeadingSuggest } from './extensions/SceneHeadingSuggest';
import { TransitionSuggest } from './extensions/TransitionSuggest';
import { useCharacterExtraction } from '@/hooks/useCharacterExtraction';
import { SceneEditorToolbar } from './components/SceneEditorToolbar';
import { SceneEditorBubbleMenu } from './components/SceneEditorBubbleMenu';
import './extensions/autocomplete.css';
import styles from './SceneEditor.module.css';

interface SceneEditorProps {
  projectId: string;
}

export function SceneEditor({ projectId }: SceneEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { characterNames, addCharacterName, updateCharacterNames } = useCharacterExtraction(projectId);

  // Load existing content
  const loadContent = useCallback(async (editor: any) => {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        console.log('No authenticated user for loading content');
        return;
      }

      const { data, error } = await supabase
        .from('scenes')
        .select('content_richtext')
        .eq('id', projectId)
        .eq('author_id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading content:', error);
        return;
      }

      if (data?.content_richtext) {
        console.log('Loading existing content:', data.content_richtext);
        editor.commands.setContent(data.content_richtext);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  }, [projectId]);

  // Debounced save to Supabase
  const debouncedSave = useCallback(
    debounce(async (content: any) => {
      try {
        setSaveStatus('saving');
        console.log('Attempting to save content:', content);
        const { data: userData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          setSaveStatus('error');
          return;
        }
        
        if (!userData.user) {
          console.log('No authenticated user found');
          setSaveStatus('error');
          return;
        }
        
        console.log('Saving for user:', userData.user.id);
        const { error } = await supabase
          .from('scenes')
          .upsert({
            id: projectId,
            author_id: userData.user.id,
            project_id: projectId,
            content_richtext: content,
            updated_at: new Date().toISOString(),
          });
          
        if (error) {
          console.error('Save error:', error);
          setSaveStatus('error');
        } else {
          console.log('Content saved successfully');
          setSaveStatus('saved');
          // Reset to idle after showing saved status
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        console.error('Failed to save:', error);
        setSaveStatus('error');
      }
    }, 1000),
    [projectId]
  );

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      SceneHeadingNode,
      ActionNode,
      CharacterNode,
      DialogueNode,
      ParentheticalNode,
      TransitionNode,
      ScreenplayShortcuts,
      SceneHeadingSuggest,
      TransitionSuggest,
      // Temporarily disable placeholder suggestions to isolate the issue
      // PlaceholderSuggestionsExtension.configure({
      //   characterNames,
      // }),
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          content: [{ type: 'text', text: ' ' }], // Use space instead of empty string to avoid TipTap error
        },
      ],
    },
    editorProps: {
      attributes: {
        class: styles.screenplayEditor,
      },
    },
    onUpdate: ({ editor }) => {
      console.log('Editor content updated');
      setSaveStatus('idle'); // Reset status when content changes
      const content = editor.getJSON();
      debouncedSave(content);
      // Update character names when content changes
      updateCharacterNames();
    },
    onCreate: ({ editor }) => {
      setIsLoading(false);
      // Load existing content first
      loadContent(editor);
      // Focus at the start of the document
      setTimeout(() => {
        editor.commands.focus('start');
      }, 100);
    },
  });


  if (isLoading || !editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <SceneEditorToolbar projectId={projectId} />
      
      {/* Save Status Indicator */}
      <div className="px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground flex items-center gap-2">
        <span>Scene Editor</span>
        {saveStatus === 'saving' && (
          <span className="text-blue-600">💾 Saving...</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-green-600">✅ Saved</span>
        )}
        {saveStatus === 'error' && (
          <span className="text-red-600">❌ Save failed</span>
        )}
      </div>
      
      <div className={styles.editorContainer}>
        <div className={styles.page}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <SceneEditorBubbleMenu editor={editor} />
    </div>
  );
}

export default SceneEditor;