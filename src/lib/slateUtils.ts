
import { Editor } from 'slate';
import { ScriptElement, SlateElementType, SlateDocument } from './types';

// Convert script elements to Slate document format
export const scriptToSlate = (elements: ScriptElement[]): SlateDocument => {
  return elements.map(element => ({
    id: element.id,
    type: element.type,
    children: [{ text: element.text }],
    tags: element.tags,
    act: element.act,
    beat: element.beat,
    page: element.page,
    continued: element.continued
  }));
};

// Convert Slate document back to script elements format
export const slateToScript = (document: SlateDocument): ScriptElement[] => {
  return document.map(node => ({
    id: node.id,
    type: node.type,
    text: node.children.map(child => child.text).join(''),
    tags: node.tags,
    act: node.act,
    beat: node.beat,
    page: node.page,
    continued: node.continued
  }));
};

// Create a new Slate element with default values
export const createSlateElement = (
  type: SlateElementType['type'],
  text: string = '',
  id: string = crypto.randomUUID()
): SlateElementType => {
  return {
    id,
    type,
    children: [{ text }],
    tags: [],
  };
};

// Helper to get text content from a Slate element
export const getNodeText = (node: SlateElementType) => {
  return node.children.map(child => child.text).join('');
};

// Check if an element is of a specific type
export const isElementType = (element: SlateElementType, type: SlateElementType['type']) => {
  return element.type === type;
};

// Check if the selection is in a specific element type
export const isSelectionInType = (editor: Editor, type: SlateElementType['type']) => {
  const [match] = Editor.nodes(editor, {
    match: n => isElementType(n as SlateElementType, type),
  });
  return !!match;
};

// Auto-format text based on element type
export const formatTextForElementType = (text: string, type: SlateElementType['type']): string => {
  if (type === 'scene-heading' || type === 'character' || type === 'transition') {
    return text.toUpperCase();
  }
  return text;
};

// Calculate the approximate height of an element in pixels
export const calculateElementHeight = (type: SlateElementType['type'], text: string): number => {
  // Average character width in Courier font (12pt) is about 7.2px
  // Average line height is about 14.4px
  const charsPerLine = {
    'scene-heading': 60,
    'action': 60,
    'character': 38,
    'dialogue': 35,
    'parenthetical': 25,
    'transition': 60,
    'note': 60
  };
  
  const baseHeight = 14.4; // Line height in pixels
  const chars = text.length;
  const lines = Math.ceil(chars / (charsPerLine[type] || 60));
  
  // Add extra spacing for different element types
  const spacing = {
    'scene-heading': 24, // Extra spacing before/after
    'action': 12,
    'character': 12,
    'dialogue': 0,
    'parenthetical': 0,
    'transition': 24,
    'note': 8
  };
  
  return (lines * baseHeight) + (spacing[type] || 0);
};

// Check if two elements should be kept together (e.g., character and dialogue)
export const shouldKeepTogether = (element1: SlateElementType, element2: SlateElementType): boolean => {
  // Character and dialogue should stay together
  if (element1.type === 'character' && element2.type === 'dialogue') {
    return true;
  }
  
  // Character and parenthetical should stay together
  if (element1.type === 'character' && element2.type === 'parenthetical') {
    return true;
  }
  
  // Parenthetical and dialogue should stay together
  if (element1.type === 'parenthetical' && element2.type === 'dialogue') {
    return true;
  }
  
  return false;
};

// Create a continuation element (for dialogue that spans multiple pages)
export const createContinuationElement = (
  originalElement: SlateElementType, 
  isContinuedFrom: boolean
): SlateElementType => {
  if (originalElement.type === 'character' && isContinuedFrom) {
    // Add (CONT'D) to character name for continuation
    const text = getNodeText(originalElement);
    return {
      ...originalElement,
      id: crypto.randomUUID(),
      children: [{ text: `${text} (CONT'D)` }],
      continued: true
    };
  }
  
  // For other elements, just clone them
  return {
    ...originalElement,
    id: crypto.randomUUID(),
    continued: true
  };
};
