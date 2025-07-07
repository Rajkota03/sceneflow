import { Node } from '@tiptap/core';

export const CharacterNode = Node.create({
  name: 'character',
  
  group: 'block',
  
  content: 'text*',
  
  defining: true,
  
  addAttributes() {
    return {
      elementType: {
        default: 'character',
      },
      name: {
        default: null,
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'p[data-type="character"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-type': 'character', ...HTMLAttributes }, 0];
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-3': () => this.editor.commands.setNode('character'),
    };
  },
});