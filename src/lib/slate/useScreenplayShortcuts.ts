import React from 'react';
import { Editor, Transforms, BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export function useScreenplayShortcuts(editor: CustomEditor) {
  const mapNext = {
    sceneHeading: 'action',
    action: 'action',
    character: 'dialogue',
    parenthetical: 'dialogue',
    dialogue: 'dialogue',
    transition: 'sceneHeading',
  };

  return {
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!editor.selection) return;
      
      try {
        const [node] = Editor.node(editor, editor.selection);
        const elemType = (node as any).elementType || 'action';

        // Tab / Shift-Tab cycle
        if (e.key === 'Tab') {
          e.preventDefault();
          const order = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
          const idx = order.indexOf(elemType);
          const next = e.shiftKey ? order[(idx - 1 + order.length) % order.length]
                                  : order[(idx + 1) % order.length];
          Transforms.setNodes(editor, { type: next } as any);
          return;
        }

        // Enter inserts logical next element
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const nextType = mapNext[elemType] ?? 'action';
          Transforms.splitNodes(editor);
          Transforms.setNodes(editor, { type: nextType } as any);
          return;
        }

        // ⌘/Ctrl + 1-6 direct jumps
        if (e.metaKey || e.ctrlKey) {
          const num = Number(e.key);
          if (num && num >= 1 && num <= 6) {
            e.preventDefault();
            const direct = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'][num - 1];
            Transforms.setNodes(editor, { type: direct } as any);
          }
        }
      } catch (error) {
        console.warn('Screenplay shortcut error:', error);
      }
    },
  };
}