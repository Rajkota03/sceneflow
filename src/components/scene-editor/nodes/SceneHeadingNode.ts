import { Node } from '@tiptap/core';

export const SceneHeadingNode = Node.create({
  name: 'sceneHeading',
  
  group: 'block',
  
  content: 'text*',
  
  defining: true,
  
  addAttributes() {
    return {
      elementType: {
        default: 'sceneHeading',
      },
      slug: {
        default: null,
      },
      number: {
        default: null,
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'h3[data-type="scene-heading"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['h3', { 'data-type': 'scene-heading', ...HTMLAttributes }, 0];
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-1': () => this.editor.commands.setNode('sceneHeading'),
    };
  },
});