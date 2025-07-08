import { Extension } from '@tiptap/core';

const nextMap = {
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
        const currentNode = this.editor.state.selection.$from.parent;
        const elementType = currentNode.type.name;
        const nextType = nextMap[elementType] ?? 'action';
        
        // Create a new node of the specified type
        return this.editor.commands.splitBlock() && this.editor.commands.setNode(nextType);
      },
      
      'Mod-1': () => this.editor.commands.setNode('sceneHeading'),
      'Mod-2': () => this.editor.commands.setNode('action'),
      'Mod-3': () => this.editor.commands.setNode('character'),
      'Mod-4': () => this.editor.commands.setNode('parenthetical'),
      'Mod-5': () => this.editor.commands.setNode('dialogue'),
      'Mod-6': () => this.editor.commands.setNode('transition'),
      
      Tab: () => {
        // Cycle through element types
        const currentNode = this.editor.state.selection.$from.parent;
        const elementType = currentNode.type.name;
        const types = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
        const currentIndex = types.indexOf(elementType);
        const nextIndex = (currentIndex + 1) % types.length;
        return this.editor.commands.setNode(types[nextIndex]);
      },
      
      'Shift-Tab': () => {
        // Cycle backwards through element types
        const currentNode = this.editor.state.selection.$from.parent;
        const elementType = currentNode.type.name;
        const types = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
        const currentIndex = types.indexOf(elementType);
        const nextIndex = (currentIndex - 1 + types.length) % types.length;
        return this.editor.commands.setNode(types[nextIndex]);
      },
    };
  },
});