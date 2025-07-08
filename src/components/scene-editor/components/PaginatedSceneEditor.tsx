import React, { useEffect, useState, useCallback, useRef } from 'react';
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
} from '../nodes';
import { ScreenplayShortcuts } from '../extensions/ScreenplayShortcuts';
import { SceneHeadingSuggest } from '../extensions/SceneHeadingSuggest';
import { TransitionSuggest } from '../extensions/TransitionSuggest';
import { useCharacterExtraction } from '@/hooks/useCharacterExtraction';
import { SceneEditorToolbar } from './SceneEditorToolbar';
import { SceneEditorBubbleMenu } from './SceneEditorBubbleMenu';
import '../extensions/autocomplete.css';
import styles from './PaginatedSceneEditor.module.css';


interface PaginatedSceneEditorProps {
  projectId: string;
}

export function PaginatedSceneEditor({ projectId }: PaginatedSceneEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pageCount, setPageCount] = useState(1);
  const { characterNames, addCharacterName, updateCharacterNames } = useCharacterExtraction(projectId);

  // Constants for page measurements (in pixels, approximate)
  const PAGE_CONTENT_HEIGHT = 648; // Approximate height for one page of content

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
        .maybeSingle();

      if (error) {
        console.error('Error loading content:', error);
        return;
      }

      if (data?.content_richtext) {
        console.log('Loading existing content:', data.content_richtext);
        editor.commands.setContent(data.content_richtext);
      } else {
        console.log('No existing content found, using default');
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
          setSaveStatus('saved');
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
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          content: [{ type: 'text', text: ' ' }],
        },
      ],
    },
    editorProps: {
      attributes: {
        class: styles.screenplayEditor,
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('idle');
      const content = editor.getJSON();
      debouncedSave(content);
      updateCharacterNames();
      // Simple page calculation based on content height
      setTimeout(() => {
        const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
        if (editorElement) {
          const contentHeight = editorElement.scrollHeight;
          const calculatedPages = Math.max(1, Math.ceil(contentHeight / PAGE_CONTENT_HEIGHT));
          setPageCount(calculatedPages);
        }
      }, 100);
    },
    onCreate: ({ editor }) => {
      setIsLoading(false);
      loadContent(editor);
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
      <div className="px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
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
        <div className="text-sm font-medium">
          Total Pages: {pageCount}
        </div>
      </div>
      
      {/* Single page layout with page counter */}
      <div className={styles.printLayoutContainer}>
        <div className={styles.pagesContainer}>
          <div className={styles.page}>
            <div className={styles.pageNumber}>{pageCount > 1 ? `1-${pageCount}` : '1'}</div>
            <div className={styles.pageContent}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      <SceneEditorBubbleMenu editor={editor} />
    </div>
  );
}

export default PaginatedSceneEditor;