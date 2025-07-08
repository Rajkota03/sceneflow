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
  const [currentPageCount, setCurrentPageCount] = useState(1);
  const { characterNames, addCharacterName, updateCharacterNames } = useCharacterExtraction(projectId);
  const editorRef = useRef<HTMLDivElement>(null);

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
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        console.error('Failed to save:', error);
        setSaveStatus('error');
      }
    }, 1000),
    [projectId]
  );

  // Calculate pages based on content height
  const calculatePages = useCallback(() => {
    if (!editorRef.current) return;
    
    const proseMirror = editorRef.current.querySelector('.ProseMirror');
    if (!proseMirror) return;

    // Standard page content height (11in - 2in margins = 9in at 96 DPI)
    const pageContentHeight = 9 * 96; // 864px
    const totalContentHeight = proseMirror.scrollHeight;
    
    const calculatedPages = Math.max(1, Math.ceil(totalContentHeight / pageContentHeight));
    setCurrentPageCount(calculatedPages);
  }, []);

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
      // Recalculate pages on content change
      setTimeout(calculatePages, 100);
    },
    onCreate: ({ editor }) => {
      setIsLoading(false);
      loadContent(editor);
      setTimeout(() => {
        editor.commands.focus('start');
        calculatePages();
      }, 100);
    },
  });

  // Monitor content changes for pagination
  useEffect(() => {
    if (!editor || !editorRef.current) return;

    const observer = new ResizeObserver(calculatePages);
    const proseMirror = editorRef.current.querySelector('.ProseMirror');
    
    if (proseMirror) {
      observer.observe(proseMirror);
    }

    return () => observer.disconnect();
  }, [editor, calculatePages]);

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
        <span className="text-xs">({currentPageCount} page{currentPageCount !== 1 ? 's' : ''})</span>
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
      
      {/* Main scrollable container */}
      <div className={styles.scrollContainer}>
        <div className={styles.pagesWrapper}>
          <div className={styles.pageContainer} ref={editorRef}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <SceneEditorBubbleMenu editor={editor} />
    </div>
  );
}

export default PaginatedSceneEditor;