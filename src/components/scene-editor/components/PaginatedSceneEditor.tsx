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
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);
  const { characterNames, addCharacterName, updateCharacterNames } = useCharacterExtraction(projectId);
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
        // Trigger page break calculation after content is loaded
        setTimeout(() => calculatePageBreaks(), 100);
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

  // Calculate where page breaks should occur based on content height
  const calculatePageBreaks = useCallback(() => {
    if (!contentRef.current) return;
    
    const content = contentRef.current;
    const contentHeight = content.scrollHeight;
    
    // Standard page content height (11in - 2in margins = 9in at 96 DPI)
    const pageContentHeight = 9 * 96; // 864px
    
    const breaks: number[] = [];
    let currentHeight = pageContentHeight;
    
    while (currentHeight < contentHeight) {
      breaks.push(currentHeight);
      currentHeight += pageContentHeight;
    }
    
    setPageBreaks(breaks);
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
      console.log('Editor content updated');
      setSaveStatus('idle');
      const content = editor.getJSON();
      debouncedSave(content);
      updateCharacterNames();
      // Recalculate page breaks on content change
      setTimeout(() => calculatePageBreaks(), 50);
    },
    onCreate: ({ editor }) => {
      setIsLoading(false);
      loadContent(editor);
      setTimeout(() => {
        editor.commands.focus('start');
        calculatePageBreaks();
      }, 100);
    },
  });

  // Handle content changes to update page breaks
  useEffect(() => {
    if (!editor || !contentRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      calculatePageBreaks();
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [editor, calculatePageBreaks]);

  if (isLoading || !editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  const pageCount = pageBreaks.length + 1;

  return (
    <div className="h-full flex flex-col">
      <SceneEditorToolbar projectId={projectId} />
      
      {/* Save Status Indicator */}
      <div className="px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground flex items-center gap-2">
        <span>Scene Editor</span>
        <span className="text-xs">({pageCount} page{pageCount !== 1 ? 's' : ''})</span>
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
      
      {/* Scrollable container */}
      <div className={styles.pagesContainer}>
        <div className={styles.pagesWrapper}>
          {/* Single continuous page with visual breaks */}
          <div className={styles.page} ref={editorRef}>
            {/* Page breaks overlay */}
            {pageBreaks.map((breakPoint, index) => (
              <div
                key={index}
                className={styles.pageBreak}
                style={{ top: `${breakPoint}px` }}
              >
                <div className={styles.pageBreakLine} />
                <div className={styles.pageNumber}>
                  {index + 2}
                </div>
              </div>
            ))}
            
            {/* Editor content */}
            <div ref={contentRef} className={styles.editorContent}>
              <EditorContent editor={editor} />
            </div>
            
            {/* Page 1 number */}
            <div className={styles.pageNumber} style={{ top: '0.5in', right: '1in' }}>
              1
            </div>
          </div>
        </div>
      </div>

      <SceneEditorBubbleMenu editor={editor} />
    </div>
  );
}

export default PaginatedSceneEditor;