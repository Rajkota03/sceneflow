import { Extension } from '@tiptap/core';

const nextMap: Record<string, string> = {
  sceneHeading: 'action',
  action: 'action', 
  character: 'dialogue',
  parenthetical: 'dialogue',
  dialogue: 'action',
  transition: 'sceneHeading',
};

export const ScreenplayShortcuts = Extension.create({
  name: 'screenplayShortcuts',

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        try {
          const { state } = this.editor;
          const { $from } = state.selection;
          const currentNode = $from.parent;
          const elementType = currentNode.type.name;
          const nextType = nextMap[elementType] || 'action';
          
          console.log(`Enter pressed: ${elementType} -> ${nextType}`);
          
          // Split the current block and set the new node type
          return this.editor.commands.enter() && this.editor.commands.setNode(nextType);
        } catch (error) {
          console.error('Error handling Enter key:', error);
          return false;
        }
      },
      
      'Mod-1': () => {
        console.log('Mod-1 pressed: switching to sceneHeading');
        return this.editor.commands.setNode('sceneHeading');
      },
      'Mod-2': () => {
        console.log('Mod-2 pressed: switching to action');
        return this.editor.commands.setNode('action');
      },
      'Mod-3': () => {
        console.log('Mod-3 pressed: switching to character');
        return this.editor.commands.setNode('character');
      },
      'Mod-4': () => {
        console.log('Mod-4 pressed: switching to parenthetical');
        return this.editor.commands.setNode('parenthetical');
      },
      'Mod-5': () => {
        console.log('Mod-5 pressed: switching to dialogue');
        return this.editor.commands.setNode('dialogue');
      },
      'Mod-6': () => {
        console.log('Mod-6 pressed: switching to transition');
        return this.editor.commands.setNode('transition');
      },
      
      Tab: () => {
        try {
          const { state } = this.editor;
          const { $from } = state.selection;
          const currentNode = $from.parent;
          const elementType = currentNode.type.name;
          const types = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
          const currentIndex = types.indexOf(elementType);
          const nextIndex = (currentIndex + 1) % types.length;
          console.log(`Tab pressed: ${elementType} -> ${types[nextIndex]}`);
          return this.editor.commands.setNode(types[nextIndex]);
        } catch (error) {
          console.error('Error handling Tab key:', error);
          return false;
        }
      },
      
      'Shift-Tab': () => {
        try {
          const { state } = this.editor;
          const { $from } = state.selection;
          const currentNode = $from.parent;
          const elementType = currentNode.type.name;
          const types = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
          const currentIndex = types.indexOf(elementType);
          const nextIndex = (currentIndex - 1 + types.length) % types.length;
          console.log(`Shift-Tab pressed: ${elementType} -> ${types[nextIndex]}`);
          return this.editor.commands.setNode(types[nextIndex]);
        } catch (error) {
          console.error('Error handling Shift-Tab key:', error);
          return false;
        }
      },
    };
  },
});