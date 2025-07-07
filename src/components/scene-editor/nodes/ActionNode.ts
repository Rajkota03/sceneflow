import { Node } from '@tiptap/core';

export const ActionNode = Node.create({
  name: 'action',
  
  group: 'block',
  
  content: 'text*',
  
  defining: true,
  
  addAttributes() {
    return {
      elementType: {
        default: 'action',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'p[data-type="action"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-type': 'action', ...HTMLAttributes }, 0];
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-2': () => this.editor.commands.setNode('action'),
    };
  },
});