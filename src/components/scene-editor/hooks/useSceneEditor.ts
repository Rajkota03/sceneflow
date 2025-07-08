import { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/lib/utils/debounce';
import {
  SceneHeadingNode,
  ActionNode,
  CharacterNode,
  DialogueNode,
  ParentheticalNode,
  TransitionNode,
} from '../nodes';

interface UseSceneEditorProps {
  projectId: string;
}

export function useSceneEditor({ projectId }: UseSceneEditorProps) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  // Helper function to focus at top-left and scroll to document start
  const focusTopLeft = useCallback((editor: any) => {
    try {
      editor.commands.focus();
      editor.commands.setTextSelection(0);
      editor.commands.selectTextblockStart();
      
      // Scroll to top of document to make cursor visible
      const editorElement = editor.view.dom;
      const scrollContainer = editorElement.closest('.overflow-auto') || editorElement.closest('[data-radix-scroll-area-viewport]') || window;
      
      if (scrollContainer === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollTop = 0;
      }
    } catch (error) {
      console.warn('Could not focus at top-left:', error);
    }
  }, []);

  // Initialize WebSocket provider for collaboration
  useEffect(() => {
    const wsProvider = new WebsocketProvider(
      'wss://connect.yjs.dev',
      `project-${projectId}`,
      ydoc
    );
    setProvider(wsProvider);
    
    return () => {
      wsProvider.destroy();
    };
  }, [projectId, ydoc]);

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
      SceneHeadingNode,
      ActionNode,
      CharacterNode,
      DialogueNode,
      ParentheticalNode,
      TransitionNode,
      Collaboration.configure({
        document: ydoc,
      }),
      ...(provider ? [CollaborationCursor.configure({
        provider: provider,
        user: {
          name: 'Writer',
          color: '#3b82f6',
        },
      })] : []),
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
        class: 'screenplay-editor focus:outline-none',
        style: 'font-family: "Courier Final Draft", "Courier Prime", "Courier New", monospace; font-size: 12pt; line-height: 1.2;',
      },
    },
    onUpdate: ({ editor }) => {
      try {
        debouncedSave(editor.getJSON());
      } catch (error) {
        console.warn('Save error:', error);
      }
    },
    onCreate: ({ editor }) => {
      setTimeout(() => {
        try {
          focusTopLeft(editor);
          editor.commands.setNode('sceneHeading');
        } catch (error) {
          console.warn('Could not focus editor on create:', error);
        }
      }, 100);
    },
  }, [provider, debouncedSave, focusTopLeft]);

  // Focus at top-left after mount and provider ready
  useEffect(() => {
    if (editor && provider) {
      setTimeout(() => {
        focusTopLeft(editor);
      }, 500);
    }
  }, [editor, provider, focusTopLeft]);

  return {
    editor,
    provider,
    focusTopLeft,
  };
}