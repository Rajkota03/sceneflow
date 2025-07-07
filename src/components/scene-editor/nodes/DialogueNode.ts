import { Node } from '@tiptap/core';

export const DialogueNode = Node.create({
  name: 'dialogue',
  
  group: 'block',
  
  content: 'text*',
  
  defining: true,
  
  addAttributes() {
    return {
      elementType: {
        default: 'dialogue',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'p[data-type="dialogue"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-type': 'dialogue', ...HTMLAttributes }, 0];
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-5': () => this.editor.commands.setNode('dialogue'),
    };
  },
});