import { Node } from '@tiptap/core';

export const SceneHeadingNode = Node.create({
  name: 'sceneHeading',
  group: 'block',
  content: 'inline*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'sceneHeading' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-type="scene-heading"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-type': 'scene-heading', class: 'sceneHeading', ...HTMLAttributes }, 0];
  },
});

export const ActionNode = Node.create({
  name: 'action',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'action' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="action"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'action', class: 'action', ...HTMLAttributes }, 0];
  },
});

export const CharacterNode = Node.create({
  name: 'character',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'character' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="character"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'character', class: 'character', ...HTMLAttributes }, 0];
  },
});

export const DialogueNode = Node.create({
  name: 'dialogue',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'dialogue' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="dialogue"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'dialogue', class: 'dialogue', ...HTMLAttributes }, 0];
  },
});

export const ParentheticalNode = Node.create({
  name: 'parenthetical',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'parenthetical' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="parenthetical"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'parenthetical', class: 'parenthetical', ...HTMLAttributes }, 0];
  },
});

export const TransitionNode = Node.create({
  name: 'transition',
  group: 'block',
  content: 'text*',
  defining: true,
  
  addAttributes() {
    return {
      elementType: { default: 'transition' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'p[data-element-type="transition"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-element-type': 'transition', class: 'transition', ...HTMLAttributes }, 0];
  },
});