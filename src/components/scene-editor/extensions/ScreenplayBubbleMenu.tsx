import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Editor } from '@tiptap/core';

interface ScreenplayBubbleMenuProps {
  editor: Editor;
}

export function ScreenplayBubbleMenu({ editor }: ScreenplayBubbleMenuProps) {
  const items = [
    { type: 'sceneHeading', label: 'Scene' },
    { type: 'action', label: 'Action' },
    { type: 'character', label: 'Character' },
    { type: 'dialogue', label: 'Dialogue' },
    { type: 'parenthetical', label: 'Paren' },
    { type: 'transition', label: 'Trans' },
  ];

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ 
        duration: 100, 
        placement: 'top',
        arrow: false
      }}
    >
      <div className="flex space-x-1 rounded-xl bg-white border border-border p-1 shadow-lg">
        {items.map(item => (
          <button
            key={item.type}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              editor.isActive(item.type) 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => editor.commands.setNode(item.type)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </BubbleMenu>
  );
}