import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { History } from '@tiptap/extension-history';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Node } from '@tiptap/core';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

// Custom Screenplay Nodes
const SceneHeadingNode = Node.create({
  name: 'sceneHeading',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'sceneHeading' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'h3[data-element-type="sceneHeading"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['h3', { 'data-element-type': 'sceneHeading', ...HTMLAttributes }, 0];
  },
});

const ActionNode = Node.create({
  name: 'action',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'action' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="action"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'action', ...HTMLAttributes }, 0];
  },
});

const CharacterNode = Node.create({
  name: 'character',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'character' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="character"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'character', ...HTMLAttributes }, 0];
  },
});

const DialogueNode = Node.create({
  name: 'dialogue',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'dialogue' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="dialogue"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'dialogue', ...HTMLAttributes }, 0];
  },
});

const ParentheticalNode = Node.create({
  name: 'parenthetical',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'parenthetical' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="parenthetical"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'parenthetical', ...HTMLAttributes }, 0];
  },
});

const TransitionNode = Node.create({
  name: 'transition',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'transition' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="transition"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'transition', ...HTMLAttributes }, 0];
  },
});

interface SceneEditorProps {
  scriptId: string;
}

export function SceneEditor({ scriptId }: SceneEditorProps) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  
  // Initialize WebSocket provider
  useEffect(() => {
    const wsProvider = new WebsocketProvider(
      'wss://connect.yjs.dev',
      `script-${scriptId}`,
      ydoc
    );
    setProvider(wsProvider);
    
    return () => {
      wsProvider.destroy();
    };
  }, [scriptId, ydoc]);

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
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: 'Writer',
          color: '#3b82f6',
        },
      }),
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { elementType: 'action' },
          content: [{ type: 'text', text: 'Start writing your scene here...' }],
        },
      ],
    },
    editorProps: {
      attributes: {
        class: 'screenplay-editor prose prose-lg max-w-none focus:outline-none min-h-96',
        style: 'font-family: "Courier Final Draft", "Courier Prime", "Courier New", monospace; font-size: 12pt; line-height: 1.2;',
      },
      handleClick: () => {
        // Let the editor handle clicks naturally
        return false;
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
      // Ensure editor has valid content and focus
      setTimeout(() => {
        try {
          // Check if document is empty or invalid
          if (!editor.state.doc.content.size || editor.state.doc.content.size === 0) {
            editor.commands.setContent({
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: { elementType: 'action' },
                  content: [{ type: 'text', text: 'Start writing...' }],
                },
              ],
            });
          }
          editor.commands.focus('end');
        } catch (error) {
          console.warn('Could not focus editor on create:', error);
        }
      }, 100);
    },
  });

  // Debounced save to Supabase
  const debouncedSave = useCallback(
    debounce(async (content: any) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        
        await supabase
          .from('scenes')
          .upsert({
            id: scriptId,
            author_id: userData.user.id,
            project_id: 'temp-project', // TODO: Get actual project ID
            content_richtext: content,
            updated_at: new Date().toISOString(),
          });
      } catch (error) {
        console.error('Failed to save:', error);
      }
    }, 1000),
    [scriptId]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      try {
        const { selection } = editor.state;
        if (!selection) return;
        
        const node = editor.state.doc.nodeAt(selection.from);
        const currentType = node?.attrs?.elementType || 'action';

        // Tab cycling
        if (event.key === 'Tab') {
          event.preventDefault();
          const types = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
          const currentIndex = types.indexOf(currentType);
          const nextIndex = event.shiftKey 
            ? (currentIndex - 1 + types.length) % types.length
            : (currentIndex + 1) % types.length;
          
          try {
            editor.commands.setNode(types[nextIndex]);
          } catch (error) {
            console.warn('Tab shortcut error:', error);
          }
          return;
        }

        // Enter progression - let the editor handle it naturally
        if (event.key === 'Enter' && !event.shiftKey) {
          // Let the default enter behavior work, then update the node type
          setTimeout(() => {
            try {
              const nextType = {
                sceneHeading: 'action',
                action: 'action',
                character: 'dialogue',
                parenthetical: 'dialogue',
                dialogue: 'dialogue',
                transition: 'sceneHeading',
              }[currentType] || 'action';

              editor.commands.setNode(nextType);
            } catch (error) {
              console.warn('Enter progression error:', error);
            }
          }, 10);
          return;
        }

        // Direct shortcuts (Cmd/Ctrl + 1-6)
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
            try {
              editor.commands.setNode(shortcuts[event.key]);
            } catch (error) {
              console.warn('Direct shortcut error:', error);
            }
            return;
          }
        }

        // Toggle comment (Cmd/Ctrl + Shift + C)
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'C') {
          event.preventDefault();
          // TODO: Implement comment toggle
          console.log('Comment toggle not yet implemented');
          return;
        }
      } catch (error) {
        console.warn('Keyboard shortcut error:', error);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  if (!editor) {
    return <div className="flex items-center justify-center h-96">Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Scene Editor - {scriptId}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} />
          
          {/* Bubble Menu Format Pills */}
          <BubbleMenu 
            editor={editor} 
            tippyOptions={{ 
              duration: 100,
              placement: 'top',
            }}
          >
            <div className="flex space-x-1 rounded-lg bg-background border border-border p-1 shadow-lg">
              {[
                ['sceneHeading', 'Scene'],
                ['action', 'Action'],
                ['character', 'Character'],
                ['dialogue', 'Dialogue'],
                ['parenthetical', 'Paren'],
                ['transition', 'Trans'],
              ].map(([type, label]) => (
                <button
                  key={type}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    editor.isActive(type)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => editor.commands.setNode(type)}
                >
                  {label}
                </button>
              ))}
            </div>
          </BubbleMenu>
        </div>
      </div>

      {/* Element Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .screenplay-editor h3[data-element-type="sceneHeading"] {
          font-weight: bold;
          text-transform: uppercase;
          margin: 1em 0;
          text-align: left;
        }
        
        .screenplay-editor p[data-element-type="action"] {
          margin: 0.5em 0;
          text-align: left;
        }
        
        .screenplay-editor p[data-element-type="character"] {
          font-weight: bold;
          text-transform: uppercase;
          text-align: center;
          margin: 1em auto 0;
          width: 38%;
        }
        
        .screenplay-editor p[data-element-type="dialogue"] {
          text-align: left;
          margin: 0 auto 0.8em;
          width: 62%;
        }
        
        .screenplay-editor p[data-element-type="parenthetical"] {
          text-align: left;
          margin: 0 auto;
          width: 40%;
          font-style: italic;
        }
        
        .screenplay-editor p[data-element-type="transition"] {
          font-weight: bold;
          text-transform: uppercase;
          text-align: right;
          margin: 1em 0;
        }
        `
      }} />
    </div>
  );
}

// Utility: debounce function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}