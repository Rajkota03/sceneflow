import { Node as ProseMirrorNode } from 'prosemirror-model';
import { ScriptContent, ScriptElement } from '@/lib/types';
import { screenplaySchema, ElementTypes } from '@/components/prosemirror/ScreenplaySchema';
import { generateUniqueId } from '@/lib/formatScript';

// Convert ScriptElement to ProseMirror node
export const scriptElementToNode = (element: ScriptElement): ProseMirrorNode => {
  return screenplaySchema.nodes.screenplay_element.create({
    elementType: element.type,
    elementId: element.id,
    tags: element.tags || [],
    beat: element.beat || null,
    actId: (element as any).actId || null
  }, element.text ? screenplaySchema.text(element.text) : null);
};

// Convert ProseMirror node to ScriptElement
export const nodeToScriptElement = (node: ProseMirrorNode): ScriptElement => {
  return {
    id: node.attrs.elementId || generateUniqueId(),
    type: node.attrs.elementType || ElementTypes.ACTION,
    text: node.textContent,
    tags: node.attrs.tags || [],
    beat: node.attrs.beat || undefined,
    ...(node.attrs.actId && { actId: node.attrs.actId })
  };
};

// Extract character names from document
export const extractCharacterNames = (doc: ProseMirrorNode): string[] => {
  const names = new Set<string>();
  
  doc.descendants((node) => {
    if (node.type.name === 'screenplay_element' && 
        node.attrs.elementType === ElementTypes.CHARACTER) {
      const name = node.textContent.replace(/\s*\(CONT'D\)\s*$/i, '').trim();
      if (name) {
        names.add(name);
      }
    }
  });
  
  return Array.from(names);
};

// Find element by ID in document
export const findElementById = (doc: ProseMirrorNode, elementId: string): { node: ProseMirrorNode; pos: number } | null => {
  let result: { node: ProseMirrorNode; pos: number } | null = null;
  
  doc.descendants((node, pos) => {
    if (node.type.name === 'screenplay_element' && 
        node.attrs.elementId === elementId) {
      result = { node, pos };
      return false; // Stop traversal
    }
  });
  
  return result;
};

// Get element at position
export const getElementAtPos = (doc: ProseMirrorNode, pos: number): ProseMirrorNode | null => {
  const resolvedPos = doc.resolve(pos);
  let node = resolvedPos.node();
  
  // Walk up to find screenplay_element
  for (let i = resolvedPos.depth; i >= 0; i--) {
    node = resolvedPos.node(i);
    if (node.type.name === 'screenplay_element') {
      return node;
    }
  }
  
  return null;
};

// Count elements by type
export const countElementsByType = (doc: ProseMirrorNode): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  doc.descendants((node) => {
    if (node.type.name === 'screenplay_element') {
      const type = node.attrs.elementType;
      counts[type] = (counts[type] || 0) + 1;
    }
  });
  
  return counts;
};

// Get all tags from document
export const getAllTags = (doc: ProseMirrorNode): string[] => {
  const tags = new Set<string>();
  
  doc.descendants((node) => {
    if (node.type.name === 'screenplay_element' && node.attrs.tags) {
      node.attrs.tags.forEach((tag: string) => tags.add(tag));
    }
  });
  
  return Array.from(tags);
};

// Filter elements by tag
export const filterElementsByTag = (doc: ProseMirrorNode, tag: string): ProseMirrorNode[] => {
  const elements: ProseMirrorNode[] = [];
  
  doc.descendants((node) => {
    if (node.type.name === 'screenplay_element' && 
        node.attrs.tags && 
        node.attrs.tags.includes(tag)) {
      elements.push(node);
    }
  });
  
  return elements;
};

// Calculate word count
export const calculateWordCount = (doc: ProseMirrorNode): number => {
  let wordCount = 0;
  
  doc.descendants((node) => {
    if (node.type.name === 'screenplay_element') {
      const text = node.textContent.trim();
      if (text) {
        wordCount += text.split(/\s+/).length;
      }
    }
  });
  
  return wordCount;
};

// Validate document structure
export const validateDocument = (doc: ProseMirrorNode): string[] => {
  const errors: string[] = [];
  
  doc.descendants((node, pos) => {
    if (node.type.name === 'screenplay_element') {
      // Check for required elementId
      if (!node.attrs.elementId) {
        errors.push(`Element at position ${pos} is missing elementId`);
      }
      
      // Check for valid element type
      const validTypes = Object.values(ElementTypes);
      if (!validTypes.includes(node.attrs.elementType)) {
        errors.push(`Element at position ${pos} has invalid type: ${node.attrs.elementType}`);
      }
    }
  });
  
  return errors;
};