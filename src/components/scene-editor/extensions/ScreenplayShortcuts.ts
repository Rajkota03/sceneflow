import { Extension } from '@tiptap/core';
import { ScreenplayElementType } from '../types';

const nextElementMap: Record<ScreenplayElementType, ScreenplayElementType> = {
  sceneHeading: 'action',
  action: 'action',
  character: 'dialogue',
  dialogue: 'dialogue',
  parenthetical: 'dialogue',
  transition: 'sceneHeading',
};

const elementTypeOrder: ScreenplayElementType[] = [
  'sceneHeading',
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
];

export const ScreenplayShortcuts = Extension.create({
  name: 'screenplayShortcuts',

  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        const { state } = this.editor;
        const { selection } = state;
        const node = state.doc.nodeAt(selection.from);
        
        if (node && node.attrs.elementType) {
          const currentType = node.attrs.elementType as ScreenplayElementType;
          const nextType = nextElementMap[currentType];
          
          return this.editor.commands.createParagraphNear() && 
                 this.editor.commands.setNode(nextType);
        }
        
        return false;
      },
      
      'Tab': () => {
        const { state } = this.editor;
        const { selection } = state;
        const node = state.doc.nodeAt(selection.from);
        
        if (node && node.attrs.elementType) {
          const currentType = node.attrs.elementType as ScreenplayElementType;
          const currentIndex = elementTypeOrder.indexOf(currentType);
          const nextIndex = (currentIndex + 1) % elementTypeOrder.length;
          const nextType = elementTypeOrder[nextIndex];
          
          return this.editor.commands.setNode(nextType);
        }
        
        return false;
      },
      
      'Shift-Tab': () => {
        const { state } = this.editor;
        const { selection } = state;
        const node = state.doc.nodeAt(selection.from);
        
        if (node && node.attrs.elementType) {
          const currentType = node.attrs.elementType as ScreenplayElementType;
          const currentIndex = elementTypeOrder.indexOf(currentType);
          const prevIndex = currentIndex === 0 ? elementTypeOrder.length - 1 : currentIndex - 1;
          const prevType = elementTypeOrder[prevIndex];
          
          return this.editor.commands.setNode(prevType);
        }
        
        return false;
      },
      
      'Mod-7': () => this.editor.commands.setNode('action'), // Shot (same as action)
      'Mod-8': () => this.editor.commands.setNode('action'), // General (same as action)
      'Mod-Shift-c': () => {
        // TODO: Implement comment toggle
        return true;
      },
      'Mod-k': () => {
        // TODO: Implement insert link popover
        return true;
      },
    };
  },
});