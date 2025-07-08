import React from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';

interface SceneEditorBubbleMenuProps {
  editor: Editor;
}

const elementTypes = [
  ['sceneHeading', 'Scene'],
  ['action', 'Action'],
  ['character', 'Character'],
  ['dialogue', 'Dialogue'],
  ['parenthetical', 'Paren'],
  ['transition', 'Trans'],
] as const;

export function SceneEditorBubbleMenu({ editor }: SceneEditorBubbleMenuProps) {
  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ 
        duration: 100,
        placement: 'top',
      }}
    >
      <div className="flex space-x-1 rounded-lg bg-background border border-border p-1 shadow-lg">
        {elementTypes.map(([type, label]) => (
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
  );
}