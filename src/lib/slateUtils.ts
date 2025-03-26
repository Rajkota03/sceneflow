
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
    pageBreak: element.pageBreak
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
    pageBreak: node.pageBreak
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

// Create a page break element
export const createPageBreakElement = (
  id: string = crypto.randomUUID()
): SlateElementType => {
  return {
    id,
    type: 'action',
    children: [{ text: '' }],
    pageBreak: true,
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

// Check if an element is a page break
export const isPageBreak = (element: SlateElementType) => {
  return element.pageBreak === true;
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
