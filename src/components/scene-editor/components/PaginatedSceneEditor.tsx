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

// Advanced multi-page content distribution with flow management
class MultiPageService {
  private readonly PAGE_HEIGHT = 648;
  private readonly LINE_HEIGHT = 14.4;
  private readonly LINES_PER_PAGE = Math.floor(648 / 14.4); // ~45 lines per page

  distributeContent(fullContent: any): any[] {
    if (!fullContent?.content) return [{ type: 'doc', content: [] }];
    
    const nodes = fullContent.content;
    const pages: any[] = [];
    let currentPage: any[] = [];
    let currentLineCount = 0;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeLines = this.calculateNodeLines(node);
      
      // Check if this node would overflow the page
      if (currentLineCount + nodeLines > this.LINES_PER_PAGE && currentPage.length > 0) {
        // Try to split at element boundary
        const splitResult = this.splitNodeAtBoundary(node, this.LINES_PER_PAGE - currentLineCount);
        
        if (splitResult.firstPart) {
          currentPage.push(splitResult.firstPart);
        }
        
        // Finish current page
        pages.push({ type: 'doc', content: [...currentPage] });
        
        // Start new page with remaining content
        currentPage = splitResult.secondPart ? [splitResult.secondPart] : [];
        currentLineCount = splitResult.secondPart ? this.calculateNodeLines(splitResult.secondPart) : 0;
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

  private splitNodeAtBoundary(node: any, availableLines: number): { firstPart: any | null, secondPart: any | null } {
    // For now, we'll implement basic splitting for action and dialogue elements
    if ((node.type === 'action' || node.type === 'dialogue') && node.content) {
      const text = this.getTextFromNode(node);
      const charsPerLine = node.type === 'dialogue' ? 40 : 60;
      const availableChars = availableLines * charsPerLine;
      
      if (text.length > availableChars) {
        // Find the last space before the limit to avoid breaking words
        let splitPoint = availableChars;
        while (splitPoint > 0 && text[splitPoint] !== ' ') {
          splitPoint--;
        }
        
        if (splitPoint === 0) splitPoint = availableChars; // If no space found, hard break
        
        const firstText = text.substring(0, splitPoint).trim();
        const secondText = text.substring(splitPoint).trim();
        
        return {
          firstPart: firstText ? { ...node, content: [{ type: 'text', text: firstText }] } : null,
          secondPart: secondText ? { ...node, content: [{ type: 'text', text: secondText }] } : null
        };
      }
    }
    
    // If splitting is not needed or not supported, return the whole node
    return { firstPart: null, secondPart: node };
  }

  private calculateNodeLines(node: any): number {
    switch (node.type) {
      case 'sceneHeading':
        return 2;
      case 'action':
        const actionText = this.getTextFromNode(node);
        return Math.max(1, Math.ceil(actionText.length / 60));
      case 'character':
        return 1;
      case 'dialogue':
        const dialogueText = this.getTextFromNode(node);
        return Math.max(1, Math.ceil(dialogueText.length / 40));
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

  // Page navigation functions with smooth scrolling
  const navigateToPage = useCallback((targetPageIndex: number, position: 'start' | 'end' = 'start') => {
    if (targetPageIndex >= 0 && targetPageIndex < pages.length) {
      const targetEditor = pages[targetPageIndex]?.editor;
      if (targetEditor) {
        setCurrentPage(targetPageIndex + 1);
        
        // Smooth scroll to target page first
        const pageElement = document.querySelector(`[data-page-id="${targetPageIndex + 1}"]`);
        if (pageElement) {
          pageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
        
        // Focus editor after scroll animation
        setTimeout(() => {
          if (position === 'end') {
            targetEditor.commands.focus('end');
          } else {
            targetEditor.commands.focus('start');
          }
        }, 300); // Wait for scroll animation to complete
      }
    }
  }, [pages]);

  // Enhanced keyboard shortcuts (only for page navigation, not formatting)
  const handleGlobalKeyNavigation = useCallback((event: KeyboardEvent) => {
    // Only handle pure navigation shortcuts, not formatting shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'Home':
          event.preventDefault();
          navigateToPage(0, 'start');
          break;
        case 'End':
          event.preventDefault();
          navigateToPage(pages.length - 1, 'end');
          break;
        // Removed Ctrl+1-9 shortcuts to preserve screenplay formatting shortcuts
      }
    }
  }, [pages.length, navigateToPage]);

  // Add global keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyNavigation);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyNavigation);
    };
  }, [handleGlobalKeyNavigation]);

  // Handle keyboard navigation between pages (only for navigation keys)
  const handleKeyNavigation = useCallback((event: KeyboardEvent, pageIndex: number, editor: any) => {
    // Only handle navigation keys, not text input
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(event.key)) {
      return; // Let normal text input work
    }
    
    const { selection } = editor.state;
    const { $anchor } = selection;
    
    // Check if cursor is at the beginning or end of the content
    const isAtStart = $anchor.pos <= 1;
    const isAtEnd = $anchor.pos >= editor.state.doc.content.size - 1;
    
    switch (event.key) {
      case 'ArrowUp':
        if (isAtStart && pageIndex > 0 && event.ctrlKey) { // Only with Ctrl key
          event.preventDefault();
          navigateToPage(pageIndex - 1, 'end');
        }
        break;
        
      case 'ArrowDown':
        if (isAtEnd && pageIndex < pages.length - 1 && event.ctrlKey) { // Only with Ctrl key
          event.preventDefault();
          navigateToPage(pageIndex + 1, 'start');
        }
        break;
        
      case 'PageUp':
        if (pageIndex > 0) {
          event.preventDefault();
          navigateToPage(pageIndex - 1, 'start');
        }
        break;
        
      case 'PageDown':
        if (pageIndex < pages.length - 1) {
          event.preventDefault();
          navigateToPage(pageIndex + 1, 'start');
        }
        break;
    }
  }, [pages.length, navigateToPage]);

  // Create page editor component with navigation
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

    // Add keyboard event listeners for page navigation
    useEffect(() => {
      if (!editor) return;
      
      const handleKeyDown = (event: KeyboardEvent) => {
        handleKeyNavigation(event, pageIndex, editor);
      };
      
      const editorElement = editor.view.dom;
      editorElement.addEventListener('keydown', handleKeyDown);
      
      return () => {
        editorElement.removeEventListener('keydown', handleKeyDown);
      };
    }, [editor, pageIndex, handleKeyNavigation]);

    // Update editor content when page content changes
    useEffect(() => {
      if (editor && page.content && !isUpdating) {
        const currentContent = editor.getJSON();
        if (JSON.stringify(currentContent) !== JSON.stringify(page.content)) {
          editor.commands.setContent(page.content, false);
        }
      }
    }, [page.content, editor, isUpdating]);

    // Handle focus events to update current page
    useEffect(() => {
      if (!editor) return;
      
      const handleFocus = () => {
        setCurrentPage(pageIndex + 1);
      };
      
      const editorElement = editor.view.dom;
      editorElement.addEventListener('focus', handleFocus);
      
      return () => {
        editorElement.removeEventListener('focus', handleFocus);
      };
    }, [editor, pageIndex]);

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
      
      {/* Enhanced Status Bar with Navigation */}
      <div className="px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium">Multi-Page Scene Editor</span>
          {saveStatus === 'saving' && (
            <span className="text-blue-600 animate-pulse">💾 Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-green-600">✅ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600">❌ Save failed</span>
          )}
          
          {/* Keyboard shortcuts hint - updated to show correct shortcuts */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground/70">
            <span>•</span>
            <span>Page Up/Down: Navigate pages</span>
            <span>•</span>
            <span>Ctrl+Home/End: First/Last page</span>
            <span>•</span>
            <span>Ctrl+1/2/3: Scene Heading/Action/Character</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Page navigation controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToPage(currentPage - 2, 'start')}
              disabled={currentPage <= 1}
              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Previous page (Page Up)"
            >
              ←
            </button>
            
            <div className="flex items-center gap-1 text-sm font-medium min-w-[100px] justify-center">
              <span className="text-primary">{currentPage}</span>
              <span>/</span>
              <span>{pages.length}</span>
            </div>
            
            <button
              onClick={() => navigateToPage(currentPage, 'start')}
              disabled={currentPage >= pages.length}
              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Next page (Page Down)"
            >
              →
            </button>
          </div>
          
          {/* Page overview indicator */}
          <div className="hidden lg:flex items-center gap-1">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => navigateToPage(index, 'start')}
                className={`w-2 h-6 rounded-sm transition-all ${
                  currentPage === index + 1 
                    ? 'bg-primary shadow-sm' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
                title={`Page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Multi-Page Editor Container */}
      <div className="flex-1 overflow-auto">
        <div className={styles.printLayoutContainer}>
          <div className={styles.pagesContainer}>
            {pages.map((page, index) => (
              <div 
                key={page.id} 
                className={`${styles.page} ${currentPage === page.id ? styles.activePage : ''}`}
                data-page-id={page.id}
              >
                <div className={styles.pageNumber}>
                  {page.id}
                  {currentPage === page.id && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className={styles.pageContent}>
                  <PageEditor page={page} pageIndex={index} />
                </div>
                {/* Page flow indicator */}
                {index < pages.length - 1 && (
                  <div className={styles.pageBreakIndicator}>
                    <div className="text-xs text-muted-foreground text-center py-2">
                      ⬇ Content continues on next page ⬇
                    </div>
                  </div>
                )}
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