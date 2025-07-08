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
          console.log('Current node:', currentNode);
          console.log('Available commands:', Object.keys(this.editor.commands));
          
          // First create a new paragraph
          const result = this.editor.commands.splitBlock();
          console.log('Split block result:', result);
          
          // Then set the node type
          const setNodeResult = this.editor.commands.setNode(nextType);
          console.log('Set node result:', setNodeResult);
          
          return result && setNodeResult;
        } catch (error) {
          console.error('Error handling Enter key:', error);
          return false;
        }
      },
      
      'Alt-1': () => {
        console.log('Alt-1 pressed: switching to sceneHeading');
        return this.editor.commands.setNode('sceneHeading');
      },
      'Alt-2': () => {
        console.log('Alt-2 pressed: switching to action');
        return this.editor.commands.setNode('action');
      },
      'Alt-3': () => {
        console.log('Alt-3 pressed: switching to character');
        return this.editor.commands.setNode('character');
      },
      'Alt-4': () => {
        console.log('Alt-4 pressed: switching to parenthetical');
        return this.editor.commands.setNode('parenthetical');
      },
      'Alt-5': () => {
        console.log('Alt-5 pressed: switching to dialogue');
        return this.editor.commands.setNode('dialogue');
      },
      'Alt-6': () => {
        console.log('Alt-6 pressed: switching to transition');
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