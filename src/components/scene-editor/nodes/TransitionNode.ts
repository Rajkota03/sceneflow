import { Node } from '@tiptap/core';

export const TransitionNode = Node.create({
  name: 'transition',
  
  group: 'block',
  
  content: 'text*',
  
  defining: true,
  
  addAttributes() {
    return {
      elementType: {
        default: 'transition',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'p[data-type="transition"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-type': 'transition', ...HTMLAttributes }, 0];
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-6': () => this.editor.commands.setNode('transition'),
    };
  },
});