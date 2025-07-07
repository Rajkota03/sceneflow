import React from 'react';
import { Editor, Transforms } from 'slate';
import { useSlateStatic } from 'slate-react';

export function ScreenplayFormatPills() {
  const editor = useSlateStatic();
  const items = [
    ['sceneHeading', 'Scene'],
    ['action', 'Action'],
    ['character', 'Character'],
    ['dialogue', 'Dialogue'],
    ['parenthetical', 'Paren'],
    ['transition', 'Trans'],
  ] as const;

  return (
    <div className="fixed right-4 top-1/2 flex flex-col space-y-1 bg-background border border-border p-2 rounded-xl shadow-lg">
      {items.map(([type, label]) => (
        <button
          key={type}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            // Check current element type - simplified for now
            false
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
          onMouseDown={e => {
            e.preventDefault();
            try {
              Transforms.setNodes(editor, { type: type } as any);
            } catch (error) {
              console.warn('Format pill error:', error);
            }
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}