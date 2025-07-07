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
        try {
          const { state, view } = this.editor;
          const { selection } = state;
          const { $from } = selection;
          const node = $from.node($from.depth);
          
          if (node && node.attrs && node.attrs.elementType) {
            const type = node.attrs.elementType;
            const order = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
            const idx = order.indexOf(type);
            const next = order[(idx + 1) % order.length];
            return this.editor.commands.setNode(next);
          }
        } catch (error) {
          console.warn('Tab shortcut error:', error);
        }
        return false;
      },
      'Shift-Tab': () => {
        try {
          const { state } = this.editor;
          const { selection } = state;
          const { $from } = selection;
          const node = $from.node($from.depth);
          
          if (node && node.attrs && node.attrs.elementType) {
            const type = node.attrs.elementType;
            const order = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
            const idx = order.indexOf(type);
            const prev = order[(idx - 1 + order.length) % order.length];
            return this.editor.commands.setNode(prev);
          }
        } catch (error) {
          console.warn('Shift-Tab shortcut error:', error);
        }
        return false;
      },
      Enter: () => {
        try {
          const { state } = this.editor;
          const { selection } = state;
          const { $from } = selection;
          const node = $from.node($from.depth);
          
          if (node && node.attrs && node.attrs.elementType) {
            const type = node.attrs.elementType;
            const nextType = mapNext[type] ?? 'action';
            return this.editor.commands.setNode(nextType);
          }
        } catch (error) {
          console.warn('Enter shortcut error:', error);
        }
        return false;
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