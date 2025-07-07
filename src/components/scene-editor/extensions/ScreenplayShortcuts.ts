import { Extension } from '@tiptap/core';

export const ScreenplayShortcuts = Extension.create({
  name: 'screenplayShortcuts',
  
  addKeyboardShortcuts() {
    const mapNext = {
      sceneHeading: 'action',
      action: 'action',
      character: 'dialogue',
      parenthetical: 'dialogue',
      dialogue: 'dialogue',
      transition: 'sceneHeading',
    };

    return {
      Tab: () => {
        const type = this.editor.getAttributes('paragraph').elementType;
        const order = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
        const idx = order.indexOf(type);
        const next = order[(idx + 1) % order.length];
        return this.editor.commands.setNode(next);
      },
      'Shift-Tab': () => {
        const type = this.editor.getAttributes('paragraph').elementType;
        const order = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
        const idx = order.indexOf(type);
        const prev = order[(idx - 1 + order.length) % order.length];
        return this.editor.commands.setNode(prev);
      },
      Enter: () => {
        const type = this.editor.getAttributes('paragraph').elementType;
        return this.editor.commands.setNode(mapNext[type] ?? 'action');
      },
      'Mod-1': () => this.editor.commands.setNode('sceneHeading'),
      'Mod-2': () => this.editor.commands.setNode('action'),
      'Mod-3': () => this.editor.commands.setNode('character'),
      'Mod-4': () => this.editor.commands.setNode('parenthetical'),
      'Mod-5': () => this.editor.commands.setNode('dialogue'),
      'Mod-6': () => this.editor.commands.setNode('transition'),
      'Mod-Shift-c': () => {
        // TODO: Implement comment toggle
        return true;
      },
      'Mod-k': () => {
        // TODO: Implement link bubble
        return true;
      },
    };
  },
});