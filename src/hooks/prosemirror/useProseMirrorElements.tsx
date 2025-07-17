import { useCallback, useMemo } from 'react';
import { EditorState, Transaction } from 'prosemirror-state';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { ScriptContent, ScriptElement, ElementType } from '@/lib/types';
import { 
  nodeToScriptElement, 
  extractCharacterNames,
  getAllTags,
  countElementsByType,
  calculateWordCount 
} from '@/lib/prosemirror/utils';

interface UseProseMirrorElementsProps {
  editorState: EditorState | null;
}

interface UseProseMirrorElementsReturn {
  elements: ScriptElement[];
  characterNames: string[];
  allTags: string[];
  elementCounts: Record<string, number>;
  wordCount: number;
  getElementAtPosition: (pos: number) => ScriptElement | null;
  getElementsByTag: (tag: string) => ScriptElement[];
  getElementsByType: (type: ElementType) => ScriptElement[];
}

export const useProseMirrorElements = ({ 
  editorState 
}: UseProseMirrorElementsProps): UseProseMirrorElementsReturn => {
  
  // Extract elements from current document
  const elements = useMemo(() => {
    if (!editorState) return [];
    
    const scriptElements: ScriptElement[] = [];
    
    editorState.doc.descendants((node) => {
      if (node.type.name === 'screenplay_element') {
        scriptElements.push(nodeToScriptElement(node));
      }
    });
    
    return scriptElements;
  }, [editorState]);

  // Extract character names
  const characterNames = useMemo(() => {
    if (!editorState) return [];
    return extractCharacterNames(editorState.doc);
  }, [editorState]);

  // Get all tags
  const allTags = useMemo(() => {
    if (!editorState) return [];
    return getAllTags(editorState.doc);
  }, [editorState]);

  // Count elements by type
  const elementCounts = useMemo(() => {
    if (!editorState) return {};
    return countElementsByType(editorState.doc);
  }, [editorState]);

  // Calculate word count
  const wordCount = useMemo(() => {
    if (!editorState) return 0;
    return calculateWordCount(editorState.doc);
  }, [editorState]);

  // Get element at specific position
  const getElementAtPosition = useCallback((pos: number): ScriptElement | null => {
    if (!editorState) return null;
    
    try {
      const resolvedPos = editorState.doc.resolve(pos);
      let node = resolvedPos.node();
      
      // Walk up to find screenplay_element
      for (let i = resolvedPos.depth; i >= 0; i--) {
        node = resolvedPos.node(i);
        if (node.type.name === 'screenplay_element') {
          return nodeToScriptElement(node);
        }
      }
    } catch (error) {
      console.warn('Error getting element at position:', error);
    }
    
    return null;
  }, [editorState]);

  // Get elements by tag
  const getElementsByTag = useCallback((tag: string): ScriptElement[] => {
    if (!editorState) return [];
    
    const taggedElements: ScriptElement[] = [];
    
    editorState.doc.descendants((node) => {
      if (node.type.name === 'screenplay_element' && 
          node.attrs.tags && 
          node.attrs.tags.includes(tag)) {
        taggedElements.push(nodeToScriptElement(node));
      }
    });
    
    return taggedElements;
  }, [editorState]);

  // Get elements by type
  const getElementsByType = useCallback((type: ElementType): ScriptElement[] => {
    if (!editorState) return [];
    
    const typedElements: ScriptElement[] = [];
    
    editorState.doc.descendants((node) => {
      if (node.type.name === 'screenplay_element' && 
          node.attrs.elementType === type) {
        typedElements.push(nodeToScriptElement(node));
      }
    });
    
    return typedElements;
  }, [editorState]);

  return {
    elements,
    characterNames,
    allTags,
    elementCounts,
    wordCount,
    getElementAtPosition,
    getElementsByTag,
    getElementsByType
  };
};