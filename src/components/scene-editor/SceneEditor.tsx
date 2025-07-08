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
import { SceneEditorToolbar } from './components/SceneEditorToolbar';
import { SceneEditorBubbleMenu } from './components/SceneEditorBubbleMenu';
import styles from './SceneEditor.module.css';

interface SceneEditorProps {
  projectId: string;
}

export function SceneEditor({ projectId }: SceneEditorProps) {
  const [isLoading, setIsLoading] = useState(true);

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
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          content: [{ type: 'text', text: 'INT. LOCATION - DAY' }],
        },
        {
          type: 'action',
          content: [{ type: 'text', text: 'Start writing your scene here...' }],
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
    },
    onCreate: ({ editor }) => {
      setIsLoading(false);
      // Focus and position cursor at the start
      setTimeout(() => {
        editor.commands.focus();
        editor.commands.setTextSelection(0);
      }, 100);
    },
  });

  // Keyboard shortcuts for element types
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const types = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
        const currentType = editor.getAttributes('paragraph').elementType || 'action';
        const currentIndex = types.indexOf(currentType);
        const nextIndex = event.shiftKey 
          ? (currentIndex - 1 + types.length) % types.length
          : (currentIndex + 1) % types.length;
        
        editor.commands.setNode(types[nextIndex]);
        return;
      }

      // Element type shortcuts (Cmd/Ctrl + 1-6)
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
        const shortcuts = {
          '1': 'sceneHeading',
          '2': 'action', 
          '3': 'character',
          '4': 'parenthetical',
          '5': 'dialogue',
          '6': 'transition',
        };

        if (shortcuts[event.key]) {
          event.preventDefault();
          editor.commands.setNode(shortcuts[event.key]);
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

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