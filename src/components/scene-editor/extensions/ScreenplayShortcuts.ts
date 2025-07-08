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
    const go = (type: string) => {
      return () => {
        const { state } = this.editor.view;
        const { $from } = state.selection;

        // If current block is empty, just change its type
        if ($from.parent.textContent.length === 0) {
          console.log(`${type}: Current block is empty, converting type`);
          return this.editor.commands.setNode(type);
        }

        // Otherwise split the block and convert the *new* empty one
        console.log(`${type}: Current block has content, splitting and converting new block`);
        return this.editor
          .chain()
          .splitBlock()      // like hitting Enter
          .setNode(type)     // change the new (empty) block
          .run();
      };
    };

    return {
      'Ctrl-1': go('sceneHeading'),
      'Ctrl-2': go('action'),
      'Ctrl-3': go('character'),
      'Ctrl-4': () => {
        const { state } = this.editor.view;
        const { $from } = state.selection;

        let result;
        // If current block is empty, just change its type
        if ($from.parent.textContent.length === 0) {
          console.log('parenthetical: Current block is empty, converting type');
          result = this.editor.commands.setNode('parenthetical');
        } else {
          // Otherwise split the block and convert the *new* empty one
          console.log('parenthetical: Current block has content, splitting and converting new block');
          result = this.editor
            .chain()
            .splitBlock()
            .setNode('parenthetical')
            .run();
        }
        
        if (result) {
          // Insert parentheses and position cursor between them
          this.editor.commands.insertContent('()');
          // Move cursor back one position to be between the parentheses
          this.editor.commands.setTextSelection(this.editor.state.selection.from - 1);
        }
        return result;
      },
      'Ctrl-5': go('dialogue'),
      'Ctrl-6': go('transition'),
      
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