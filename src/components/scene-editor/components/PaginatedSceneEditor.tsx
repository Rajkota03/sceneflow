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

interface PageData {
  id: number;
  content: any;
  editor: any;
}

// Multi-page content distribution service
class MultiPageService {
  private readonly PAGE_HEIGHT = 648; // Standard page height in pixels
  private readonly LINE_HEIGHT = 14.4; // 12pt * 1.2 line-height
  private readonly LINES_PER_PAGE = Math.floor(648 / 14.4); // ~45 lines per page

  distributeContent(fullContent: any): any[] {
    if (!fullContent?.content) return [{ type: 'doc', content: [] }];
    
    const nodes = fullContent.content;
    const pages: any[] = [];
    let currentPage: any[] = [];
    let currentLineCount = 0;

    for (const node of nodes) {
      const nodeLines = this.calculateNodeLines(node);
      
      // If adding this node would overflow, start a new page
      if (currentLineCount + nodeLines > this.LINES_PER_PAGE && currentPage.length > 0) {
        pages.push({ type: 'doc', content: [...currentPage] });
        currentPage = [node];
        currentLineCount = nodeLines;
      } else {
        currentPage.push(node);
        currentLineCount += nodeLines;
      }
    }

    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push({ type: 'doc', content: [...currentPage] });
    }

    // Ensure at least one page
    if (pages.length === 0) {
      pages.push({ type: 'doc', content: [] });
    }

    return pages;
  }

  private calculateNodeLines(node: any): number {
    switch (node.type) {
      case 'sceneHeading':
        return 2; // Scene headings typically take 2 lines with spacing
      case 'action':
        // Estimate based on text length (rough approximation)
        const actionText = this.getTextFromNode(node);
        return Math.max(1, Math.ceil(actionText.length / 60)); // ~60 chars per line
      case 'character':
        return 1;
      case 'dialogue':
        const dialogueText = this.getTextFromNode(node);
        return Math.max(1, Math.ceil(dialogueText.length / 40)); // ~40 chars per line for dialogue
      case 'parenthetical':
        return 1;
      case 'transition':
        return 2;
      default:
        return 1;
    }
  }

  private getTextFromNode(node: any): string {
    if (!node.content) return '';
    return node.content.map((child: any) => child.text || '').join('');
  }

  combineAllContent(pages: any[]): any {
    const allContent: any[] = [];
    
    for (const page of pages) {
      if (page.content) {
        allContent.push(...page.content);
      }
    }

    return {
      type: 'doc',
      content: allContent
    };
  }
}

export function PaginatedSceneEditor({ projectId }: PaginatedSceneEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const { characterNames, addCharacterName, updateCharacterNames } = useCharacterExtraction(projectId);
  
  const multiPageService = useRef(new MultiPageService());
  const lastFullContent = useRef<any>(null);

  // Create editor configuration
  const createEditorConfig = useCallback((initialContent: any, pageIndex: number) => ({
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
    content: initialContent,
    editorProps: {
      attributes: {
        class: styles.screenplayEditor,
      },
    },
  }), []);

  // Load existing content and distribute across pages
  const loadContent = useCallback(async () => {
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

      let fullContent;
      if (data?.content_richtext) {
        console.log('Loading existing content:', data.content_richtext);
        fullContent = data.content_richtext;
      } else {
        console.log('No existing content found, using default');
        fullContent = {
          type: 'doc',
          content: [
            {
              type: 'sceneHeading',
              content: [{ type: 'text', text: ' ' }],
            },
          ],
        };
      }

      // Distribute content across pages
      const distributedPages = multiPageService.current.distributeContent(fullContent);
      const newPages: PageData[] = distributedPages.map((pageContent, index) => ({
        id: index + 1,
        content: pageContent,
        editor: null, // Will be created when component mounts
      }));

      setPages(newPages);
      lastFullContent.current = fullContent;
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  }, [projectId]);

  // Debounced save to Supabase
  const debouncedSave = useCallback(
    debounce(async (fullContent: any) => {
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
            content_richtext: fullContent,
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

  // Handle content changes and redistribute across pages
  const handleContentChange = useCallback((changedPageIndex: number, newContent: any) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Combine all page content
    const updatedPages = [...pages];
    updatedPages[changedPageIndex] = { ...updatedPages[changedPageIndex], content: newContent };
    
    const fullContent = multiPageService.current.combineAllContent(
      updatedPages.map(p => p.content)
    );

    // Redistribute content across pages
    const redistributedPages = multiPageService.current.distributeContent(fullContent);
    
    // Update pages with new distribution
    const newPages: PageData[] = redistributedPages.map((pageContent, index) => {
      const existingPage = updatedPages[index];
      return {
        id: index + 1,
        content: pageContent,
        editor: existingPage?.editor || null,
      };
    });

    setPages(newPages);
    lastFullContent.current = fullContent;
    
    // Save the combined content
    debouncedSave(fullContent);
    updateCharacterNames();
    
    // Update editor contents after a brief delay
    setTimeout(() => {
      newPages.forEach((page, index) => {
        if (page.editor && index !== changedPageIndex) {
          page.editor.commands.setContent(page.content, false);
        }
      });
      setIsUpdating(false);
    }, 100);
  }, [pages, isUpdating, debouncedSave, updateCharacterNames]);

  // Create page editor component
  const PageEditor = ({ page, pageIndex }: { page: PageData; pageIndex: number }) => {
    const editor = useEditor({
      ...createEditorConfig(page.content, pageIndex),
      onUpdate: ({ editor }) => {
        if (!isUpdating) {
          setSaveStatus('idle');
          const content = editor.getJSON();
          handleContentChange(pageIndex, content);
        }
      },
      onCreate: ({ editor }) => {
        // Store editor reference
        setPages(prev => {
          const updated = [...prev];
          if (updated[pageIndex]) {
            updated[pageIndex].editor = editor;
          }
          return updated;
        });
        
        if (pageIndex === 0) {
          setTimeout(() => {
            editor.commands.focus('start');
          }, 100);
        }
      },
    });

    // Update editor content when page content changes
    useEffect(() => {
      if (editor && page.content && !isUpdating) {
        const currentContent = editor.getJSON();
        if (JSON.stringify(currentContent) !== JSON.stringify(page.content)) {
          editor.commands.setContent(page.content, false);
        }
      }
    }, [page.content, editor, isUpdating]);

    return editor ? <EditorContent editor={editor} /> : null;
  };

  // Initialize on mount
  useEffect(() => {
    loadContent().then(() => {
      setIsLoading(false);
    });
  }, [loadContent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading paginated editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <SceneEditorToolbar projectId={projectId} />
      
      {/* Status Bar */}
      <div className="px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Multi-Page Scene Editor</span>
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
            Total Pages: {pages.length}
          </div>
        </div>
      </div>
      
      {/* Multi-Page Editor Container */}
      <div className="flex-1 overflow-auto">
        <div className={styles.printLayoutContainer}>
          <div className={styles.pagesContainer}>
            {pages.map((page, index) => (
              <div key={page.id} className={styles.page}>
                <div className={styles.pageNumber}>{page.id}</div>
                <div className={styles.pageContent}>
                  <PageEditor page={page} pageIndex={index} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pages.length > 0 && pages[0].editor && (
        <SceneEditorBubbleMenu editor={pages[0].editor} />
      )}
    </div>
  );
}

export default PaginatedSceneEditor;