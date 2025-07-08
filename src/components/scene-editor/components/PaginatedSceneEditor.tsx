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

interface PageContent {
  id: string;
  content: any;
  height: number;
}

interface PaginatedSceneEditorProps {
  projectId: string;
}

export function PaginatedSceneEditor({ projectId }: PaginatedSceneEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pages, setPages] = useState<PageContent[]>([{ id: 'page-1', content: null, height: 0 }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const editorRefs = useRef<Map<string, any>>(new Map());
  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { characterNames, addCharacterName, updateCharacterNames } = useCharacterExtraction(projectId);

  // Constants for page measurements (in pixels, approximate)
  const PAGE_HEIGHT = 792; // 11 inches at 72 DPI
  const PAGE_CONTENT_HEIGHT = 648; // Page height minus margins (1 inch top/bottom)

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
      // Check pagination after content changes
      setTimeout(() => {
        const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
        if (editorElement) {
          const contentHeight = editorElement.scrollHeight;
          const currentPageCount = Math.ceil(contentHeight / PAGE_CONTENT_HEIGHT);
          
          if (currentPageCount > pages.length) {
            const newPages = [...pages];
            for (let i = pages.length; i < currentPageCount; i++) {
              newPages.push({
                id: `page-${i + 1}`,
                content: null,
                height: 0,
              });
            }
            setPages(newPages);
          }
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
          Page {pages.length} of {pages.length}
        </div>
      </div>
      
      {/* Print Layout Container with dynamic page cards */}
      <div className={styles.printLayoutContainer}>
        <div className={styles.pagesContainer}>
          {pages.map((page, index) => (
            <div key={page.id} className={styles.page}>
              <div className={styles.pageNumber}>{index + 1}</div>
              <div className={styles.pageContent}>
                {index === 0 ? (
                  // First page contains the main editor
                  <EditorContent editor={editor} />
                ) : (
                  // Subsequent pages show overflow content
                  <div 
                    className={styles.pageOverflow}
                    style={{
                      transform: `translateY(-${index * PAGE_CONTENT_HEIGHT}px)`,
                      height: PAGE_CONTENT_HEIGHT,
                      overflow: 'hidden',
                    }}
                  >
                    <EditorContent editor={editor} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SceneEditorBubbleMenu editor={editor} />
    </div>
  );
}

export default PaginatedSceneEditor;