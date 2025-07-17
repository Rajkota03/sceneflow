import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { screenplaySchema, ElementTypes } from './ScreenplaySchema';
import { screenplayPlugins } from './ScreenplayPlugins';
import { generateUniqueId } from '@/lib/formatScript';
import { ScriptContent, ScriptElement } from '@/lib/types';

interface ProseMirrorEditorProps {
  content: ScriptContent;
  onChange: (content: ScriptContent) => void;
  onElementFocus?: (elementId: string) => void;
  className?: string;
  editable?: boolean;
}

export interface ProseMirrorEditorRef {
  focus: () => void;
  getState: () => EditorState;
  dispatch: (tr: Transaction) => void;
  view: EditorView | null;
}

// Convert ScriptContent to ProseMirror document
const scriptContentToDoc = (content: ScriptContent): ProseMirrorNode => {
  const elements = content.elements || [];
  
  if (elements.length === 0) {
    // Create a default element if no content
    const defaultElement = screenplaySchema.nodes.screenplay_element.create({
      elementType: ElementTypes.ACTION,
      elementId: generateUniqueId(),
      tags: [],
      beat: null,
      actId: null
    }, screenplaySchema.text(''));
    
    return screenplaySchema.nodes.doc.create({}, [defaultElement]);
  }
  
  const nodes = elements.map(element => {
    return screenplaySchema.nodes.screenplay_element.create({
      elementType: element.type,
      elementId: element.id,
      tags: element.tags || [],
      beat: element.beat || null,
      actId: (element as any).actId || null
    }, element.text ? screenplaySchema.text(element.text) : null);
  });
  
  return screenplaySchema.nodes.doc.create({}, nodes);
};

// Convert ProseMirror document to ScriptContent
const docToScriptContent = (doc: ProseMirrorNode): ScriptContent => {
  const elements: ScriptElement[] = [];
  
  doc.descendants((node) => {
    if (node.type.name === 'screenplay_element') {
      elements.push({
        id: node.attrs.elementId || generateUniqueId(),
        type: node.attrs.elementType || ElementTypes.ACTION,
        text: node.textContent,
        tags: node.attrs.tags || [],
        beat: node.attrs.beat || undefined,
        // Additional properties for compatibility
        ...(node.attrs.actId && { actId: node.attrs.actId })
      });
    }
  });
  
  return { elements };
};

const ProseMirrorEditor = forwardRef<ProseMirrorEditorRef, ProseMirrorEditorProps>(({
  content,
  onChange,
  onElementFocus,
  className = '',
  editable = true
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const stateRef = useRef<EditorState | null>(null);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const doc = scriptContentToDoc(content);
    
    const state = EditorState.create({
      doc,
      plugins: screenplayPlugins
    });

    const view = new EditorView(editorRef.current, {
      state,
      editable: () => editable,
      dispatchTransaction: (tr) => {
        const newState = view.state.apply(tr);
        view.updateState(newState);
        stateRef.current = newState;
        
        // Convert back to ScriptContent and call onChange
        const newContent = docToScriptContent(newState.doc);
        onChange(newContent);
      }
    });

    viewRef.current = view;
    stateRef.current = state;

    // Handle element focus events
    const handleElementFocus = (event: CustomEvent) => {
      if (onElementFocus) {
        onElementFocus(event.detail.elementId);
      }
    };

    window.addEventListener('screenplayElementFocus', handleElementFocus as EventListener);

    return () => {
      window.removeEventListener('screenplayElementFocus', handleElementFocus as EventListener);
      view.destroy();
      viewRef.current = null;
      stateRef.current = null;
    };
  }, []); // Only run on mount

  // Update content when prop changes (but not on every change to avoid loops)
  useEffect(() => {
    if (!viewRef.current || !stateRef.current) return;
    
    const currentContent = docToScriptContent(stateRef.current.doc);
    const currentElementsText = currentContent.elements.map(e => e.text).join('|');
    const newElementsText = content.elements.map(e => e.text).join('|');
    
    // Only update if content is actually different
    if (currentElementsText !== newElementsText) {
      const newDoc = scriptContentToDoc(content);
      const newState = EditorState.create({
        doc: newDoc,
        plugins: screenplayPlugins,
        selection: stateRef.current.selection
      });
      
      viewRef.current.updateState(newState);
      stateRef.current = newState;
    }
  }, [content]);

  // Update editable state
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.setProps({ editable: () => editable });
    }
  }, [editable]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (viewRef.current) {
        viewRef.current.focus();
      }
    },
    getState: () => {
      return stateRef.current!;
    },
    dispatch: (tr: Transaction) => {
      if (viewRef.current) {
        viewRef.current.dispatch(tr);
      }
    },
    view: viewRef.current
  }), []);

  return (
    <div 
      ref={editorRef}
      className={`prosemirror-editor ${className}`}
      style={{
        fontFamily: '"Courier Prime", "Courier New", monospace',
        fontSize: '12pt',
        lineHeight: '1.2'
      }}
    />
  );
});

ProseMirrorEditor.displayName = 'ProseMirrorEditor';

export default ProseMirrorEditor;