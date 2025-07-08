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

// Content measurement service for pagination
class PaginationService {
  private readonly PAGE_HEIGHT = 648; // Standard 11" page content height in pixels
  private readonly LINE_HEIGHT = 14.4; // 12pt * 1.2 line-height in pixels
  
  measureContentHeight(element: HTMLElement): number {
    if (!element) return 0;
    return element.scrollHeight;
  }
  
  calculatePageCount(contentHeight: number): number {
    return Math.max(1, Math.ceil(contentHeight / this.PAGE_HEIGHT));
  }
  
  getPageBreakPositions(contentHeight: number): number[] {
    const pageCount = this.calculatePageCount(contentHeight);
    const positions: number[] = [];
    
    for (let i = 1; i < pageCount; i++) {
      positions.push(i * this.PAGE_HEIGHT);
    }
    
    return positions;
  }
  
  shouldAddNewPage(contentHeight: number): boolean {
    const currentPageCount = this.calculatePageCount(contentHeight);
    const remainingSpace = (currentPageCount * this.PAGE_HEIGHT) - contentHeight;
    return remainingSpace < this.LINE_HEIGHT * 3; // Add page if less than 3 lines remaining
  }
}

export function PaginatedSceneEditor({ projectId }: PaginatedSceneEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pages, setPages] = useState<Array<{ id: number; content: any }>>([{ id: 1, content: null }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const { characterNames, addCharacterName, updateCharacterNames } = useCharacterExtraction(projectId);
  
  const paginationService = useRef(new PaginationService());
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

  // Handle pagination updates
  const handleContentUpdate = useCallback((editor: any) => {
    const content = editor.getJSON();
    debouncedSave(content);
    updateCharacterNames();
    
    // Measure content and update pagination
    setTimeout(() => {
      const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
      if (editorElement) {
        const contentHeight = paginationService.current.measureContentHeight(editorElement);
        const newPageCount = paginationService.current.calculatePageCount(contentHeight);
        
        setTotalPageCount(newPageCount);
        
        // Update pages array if needed
        if (newPageCount !== pages.length) {
          const newPages = Array.from({ length: newPageCount }, (_, i) => ({
            id: i + 1,
            content: i === 0 ? content : null // Only first page gets content for now
          }));
          setPages(newPages);
        }
      }
    }, 100);
  }, [debouncedSave, updateCharacterNames, pages.length]);

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
      handleContentUpdate(editor);
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
      
      {/* Status Bar */}
      <div className="px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Paginated Scene Editor</span>
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
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPageCount}
          </div>
        </div>
      </div>
      
      {/* Paginated Editor Container */}
      <div className="flex-1 overflow-auto" ref={contentRef}>
        <div className={styles.printLayoutContainer}>
          <div className={styles.pagesContainer}>
            {pages.map((page, index) => (
              <div key={page.id} className={styles.page}>
                <div className={styles.pageNumber}>{page.id}</div>
                <div className={styles.pageContent}>
                  {index === 0 ? (
                    <EditorContent editor={editor} />
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      Page {page.id} - Content will flow here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SceneEditorBubbleMenu editor={editor} />
    </div>
  );
}

export default PaginatedSceneEditor;