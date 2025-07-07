import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';

interface RawFountainEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RawFountainEditor: React.FC<RawFountainEditorProps> = ({
  content,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        javascript(), // Using javascript highlighting as fountain placeholder
        EditorView.updateListener.of((update) => {
          if (update.changes) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return (
    <div 
      ref={editorRef} 
      className="h-full w-full font-mono text-sm border rounded-md"
      style={{ fontFamily: 'Courier, monospace' }}
    />
  );
};