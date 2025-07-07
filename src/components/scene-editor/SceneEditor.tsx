import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { History } from '@tiptap/extension-history';
// import { Collaboration } from '@tiptap/extension-collaboration';
// import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
// import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';

import { SceneEditorProps } from './types';
import { SceneHeadingNode } from './nodes/SceneHeadingNode';
import { ActionNode } from './nodes/ActionNode';
import { CharacterNode } from './nodes/CharacterNode';
import { ParentheticalNode } from './nodes/ParentheticalNode';
import { DialogueNode } from './nodes/DialogueNode';
import { TransitionNode } from './nodes/TransitionNode';
import { ScreenplayShortcuts } from './extensions/ScreenplayShortcuts';
import { useSupabasePersistence } from './hooks/useSupabasePersistence';
import { RawFountainEditor } from './components/RawFountainEditor';
import { toFountain, toFDX } from './utils/exportHelpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export function SceneEditor({ scriptId }: SceneEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'raw'>('write');
  const [fountainContent, setFountainContent] = useState('');

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      SceneHeadingNode,
      ActionNode,
      CharacterNode,
      ParentheticalNode,
      DialogueNode,
      TransitionNode,
      ScreenplayShortcuts,
      // Temporarily disable collaboration to fix build
      // Collaboration.configure({
      //   document: ydoc,
      // }),
      // CollaborationCursor.configure({
      //   provider,
      //   user: currentUser,
      // }),
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          attrs: { elementType: 'sceneHeading' },
          content: [{ type: 'text', text: 'INT. LIVING ROOM - DAY' }],
        },
        {
          type: 'action',
          attrs: { elementType: 'action' },
          content: [{ type: 'text', text: 'A character enters the room.' }],
        },
      ],
    },
    editorProps: {
      attributes: {
        class: 'screenplay-editor prose prose-lg max-w-none focus:outline-none',
      },
    },
  });

  // Set up Supabase persistence
  useSupabasePersistence(editor, scriptId);

  // Update fountain content when editor changes
  useEffect(() => {
    if (editor && activeTab === 'raw') {
      const json = editor.getJSON();
      setFountainContent(toFountain(json));
    }
  }, [editor, activeTab]);

  // Update editor when fountain content changes
  const handleFountainChange = (content: string) => {
    setFountainContent(content);
    // TODO: Parse fountain content back to editor JSON
  };

  const handleExportFountain = () => {
    if (editor) {
      const json = editor.getJSON();
      const fountain = toFountain(json);
      
      const blob = new Blob([fountain], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scene-${scriptId}.fountain`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportFDX = () => {
    if (editor) {
      const json = editor.getJSON();
      const fdx = toFDX(json);
      
      const blob = new Blob([fdx], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scene-${scriptId}.fdx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Scene Editor</h2>
        <div className="flex gap-2">
          <Button onClick={handleExportFountain} variant="outline" size="sm">
            Export Fountain
          </Button>
          <Button onClick={handleExportFDX} variant="outline" size="sm">
            Export FDX
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'write' | 'raw')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-4">
            <div className="max-w-4xl mx-auto">
              <EditorContent 
                editor={editor} 
                className="screenplay-content"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="raw" className="flex-1 overflow-hidden">
          <div className="h-full p-4">
            <div className="max-w-4xl mx-auto h-full">
              {activeTab === 'raw' && (
                <RawFountainEditor
                  content={fountainContent}
                  onChange={handleFountainChange}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { toFountain, toFDX };