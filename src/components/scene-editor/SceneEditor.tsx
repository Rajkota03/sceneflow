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
  const { characterNames, addCharacterName, updateCharacterNames } = useCharacterExtraction(projectId);

  // Debounced save to Supabase
  const debouncedSave = useCallback(
    debounce(async (content: any) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        
        await supabase
          .from('scenes')
          .upsert({
            id: projectId,
            author_id: userData.user.id,
            project_id: projectId,
            content_richtext: content,
            updated_at: new Date().toISOString(),
          });
      } catch (error) {
        console.error('Failed to save:', error);
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
      PlaceholderSuggestionsExtension.configure({
        characterNames,
      }),
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          attrs: { elementType: 'sceneHeading' },
        },
      ],
    },
    editorProps: {
      attributes: {
        class: styles.screenplayEditor,
      },
    },
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON());
      // Update character names when content changes
      updateCharacterNames();
    },
    onCreate: ({ editor }) => {
      setIsLoading(false);
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