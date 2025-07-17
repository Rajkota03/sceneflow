import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

// Define types
interface Beat {
  id: string;
  text: string;
}

interface BeatCardEditorProps {
  beat: Beat;
  locked: boolean;
  onCommit: (update: { id: string; text: string }) => void;
}

const BeatCardEditor: React.FC<BeatCardEditorProps> = ({ beat, locked, onCommit }) => {
  // TODO: Add debounce logic for live onUpdate events
  
  const handleCommit = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (trimmedText !== beat.text && trimmedText.length > 0) {
      const update = { id: beat.id, text: trimmedText };
      onCommit(update);
      
      // Broadcast event example
      // socket.emit("beat:update", { id: beat.id, text: trimmedText });
    }
  }, [beat.text, beat.id, onCommit]);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: locked ? "🔒 Beat is locked" : "Type or paste your beat here…",
      }),
    ],
    content: beat.text,
    editable: !locked,
    onBlur: ({ editor }) => {
      handleCommit(editor.getText());
    },
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleCommit(editor.getText());
      }
    };

    const element = editor.view.dom;
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, handleCommit]);

  // Update editor content when beat changes
  useEffect(() => {
    if (editor && editor.getText() !== beat.text) {
      editor.commands.setContent(beat.text);
    }
  }, [beat.text, editor]);

  // Update editable state when locked changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!locked);
    }
  }, [locked, editor]);


  if (!editor) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle p-4">
      <EditorContent 
        editor={editor}
        className="ProseMirror focus:outline-none prose prose-sm max-w-none"
      />
    </div>
  );
};

export default BeatCardEditor;