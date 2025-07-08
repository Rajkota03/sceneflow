import React from 'react';
import { EditorContent } from '@tiptap/react';
import styles from '../scene-editor/SceneEditor.module.css';
import { useSceneEditor } from '../scene-editor/hooks/useSceneEditor';
import { useKeyboardShortcuts } from '../scene-editor/hooks/useKeyboardShortcuts';
import { SceneEditorToolbar } from '../scene-editor/components/SceneEditorToolbar';
import { SceneEditorBubbleMenu } from '../scene-editor/components/SceneEditorBubbleMenu';

interface SceneEditorProps {
  projectId: string;
}

export function SceneEditor({ projectId }: SceneEditorProps) {
  const { editor, provider } = useSceneEditor({ projectId });
  
  // Apply keyboard shortcuts
  useKeyboardShortcuts(editor);

  if (!editor) {
    return <div className="flex items-center justify-center h-96">Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <SceneEditorToolbar projectId={projectId} />

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <div className="pagesContainer">
          <EditorContent editor={editor} />
          <SceneEditorBubbleMenu editor={editor} />
        </div>
      </div>
    </div>
  );
}

export default SceneEditor;