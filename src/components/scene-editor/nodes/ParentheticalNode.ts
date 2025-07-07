import { Node } from '@tiptap/core';

export const ParentheticalNode = Node.create({
  name: 'parenthetical',
  
  group: 'block',
  
  content: 'text*',
  
  defining: true,
  
  addAttributes() {
    return {
      elementType: {
        default: 'parenthetical',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'p[data-type="parenthetical"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-type': 'parenthetical', ...HTMLAttributes }, 0];
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-4': () => this.editor.commands.setNode('parenthetical'),
    };
  },
});