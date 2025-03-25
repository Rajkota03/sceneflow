
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms, Range, Node, Path, NodeEntry } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, useSlate, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { v4 as uuidv4 } from 'uuid';
import { SlateElementType, ElementType, ScriptElement } from '@/lib/types';
import { scriptToSlate, slateToScript, createSlateElement } from '@/lib/slateUtils';
import { formatType } from '@/lib/formatScript';
import { useScriptEditor } from './ScriptEditorProvider';

// Define custom element renderers for script elements
const SceneHeading = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="font-bold uppercase tracking-wider mb-4"
    style={{ width: '100%' }}
  >
    {children}
  </div>
);

const Action = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="mb-4"
    style={{ width: '100%' }}
  >
    {children}
  </div>
);

const Character = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="text-center font-bold mb-1 mx-auto uppercase"
    style={{ width: '30%', marginLeft: 'auto', marginRight: 'auto' }}
  >
    {children}
  </div>
);

const Dialogue = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="mb-4 mx-auto"
    style={{ width: '65%', marginLeft: 'auto', marginRight: 'auto' }}
  >
    {children}
  </div>
);

const Parenthetical = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="text-center italic mb-1 mx-auto"
    style={{ width: '40%', marginLeft: 'auto', marginRight: 'auto' }}
  >
    {children}
  </div>
);

const Transition = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="text-right font-bold uppercase tracking-wider mb-4"
    style={{ width: '100%' }}
  >
    {children}
  </div>
);

const Note = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="text-sm italic text-gray-500 mb-2"
    style={{ width: '100%' }}
  >
    {children}
  </div>
);

// Custom leaf renderer for text formatting
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  // Add more styling here for future formatting options
  return <span {...attributes}>{children}</span>;
};

// Declare custom types for Slate
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: SlateElementType;
    Text: { text: string };
  }
}

// Define the props for the SlateEditor component
interface SlateEditorProps {
  elements: ScriptElement[];
  onChange: (elements: ScriptElement[]) => void;
  formatState?: {
    zoomLevel: number;
  };
  beatMode?: 'on' | 'off';
  selectedStructure?: any;
  className?: string;
}

const SlateEditor: React.FC<SlateEditorProps> = ({
  elements,
  onChange,
  formatState = { zoomLevel: 1 },
  beatMode = 'on',
  selectedStructure,
  className = ''
}) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  // Convert script elements to Slate's format for the initial state
  const initialValue = useMemo(() => {
    return scriptToSlate(elements.length > 0 ? elements : [
      {
        id: uuidv4(),
        type: 'scene-heading',
        text: 'INT. SOMEWHERE - DAY'
      },
      {
        id: uuidv4(),
        type: 'action',
        text: 'Type your action here...'
      }
    ]);
  }, []);
  
  const [value, setValue] = useState<SlateElementType[]>(initialValue);
  
  // Update value when elements change from parent
  useEffect(() => {
    if (elements && elements.length > 0) {
      setValue(scriptToSlate(elements));
    }
  }, [elements]);
  
  // Define a rendering function for each element type
  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as SlateElementType;
    
    switch (element.type) {
      case 'scene-heading':
        return <SceneHeading {...props} />;
      case 'action':
        return <Action {...props} />;
      case 'character':
        return <Character {...props} />;
      case 'dialogue':
        return <Dialogue {...props} />;
      case 'parenthetical':
        return <Parenthetical {...props} />;
      case 'transition':
        return <Transition {...props} />;
      case 'note':
        return <Note {...props} />;
      default:
        return <Action {...props} />;
    }
  }, []);

  // Define a rendering function for the leaf level
  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  // Handle content changes
  const handleChange = (newValue: Descendant[]) => {
    setValue(newValue as SlateElementType[]);
    onChange(slateToScript(newValue as SlateElementType[]));
  };
  
  // Get the next element type based on the current one
  const getNextElementType = (currentType: ElementType): ElementType => {
    switch (currentType) {
      case 'scene-heading':
        return 'action';
      case 'action':
        return 'character';
      case 'character':
        return 'dialogue';
      case 'dialogue':
        return 'action';
      case 'parenthetical':
        return 'dialogue';
      case 'transition':
        return 'scene-heading';
      default:
        return 'action';
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Get the current selection
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      // @ts-ignore - We know this is our custom element type
      const [node] = Editor.node(editor, selection.focus.path.slice(0, 1));
      // @ts-ignore - We know this is our custom element type
      const elementType = (node as SlateElementType).type;
      
      // Handle Enter key
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        
        // Get the next element type based on the current one
        const nextType = getNextElementType(elementType);
        
        // Insert a new element with the appropriate type
        Transforms.insertNodes(
          editor,
          createSlateElement(nextType),
          { at: Path.next(selection.focus.path.slice(0, 1)) }
        );
        
        // Move the selection to the new element
        Transforms.select(editor, Path.next(selection.focus.path.slice(0, 1)));
        return;
      }
      
      // Handle Tab key to cycle through element types
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        
        // Get all element types in cycle order
        const elementTypes: ElementType[] = [
          'scene-heading',
          'action',
          'character',
          'dialogue',
          'parenthetical',
          'transition'
        ];
        
        // Find the current type in the cycle
        const currentIndex = elementTypes.indexOf(elementType);
        const nextIndex = (currentIndex + 1) % elementTypes.length;
        
        // Transform the current element to the next type
        Transforms.setNodes(
          editor,
          { type: elementTypes[nextIndex] } as Partial<SlateElementType>,
          { at: selection.focus.path.slice(0, 1) }
        );
        return;
      }
      
      // Format shortcuts (Cmd/Ctrl + number)
      if ((event.metaKey || event.ctrlKey) && !isNaN(Number(event.key)) && Number(event.key) >= 1 && Number(event.key) <= 6) {
        event.preventDefault();
        
        // Map numbers to element types
        const typeMap: Record<number, ElementType> = {
          1: 'scene-heading',
          2: 'action',
          3: 'character',
          4: 'dialogue',
          5: 'parenthetical',
          6: 'transition'
        };
        
        const newType = typeMap[Number(event.key)];
        
        // Apply the new type to the current element
        Transforms.setNodes(
          editor,
          { type: newType } as Partial<SlateElementType>,
          { at: selection.focus.path.slice(0, 1) }
        );
        
        // Auto-format text based on element type, if needed
        // @ts-ignore - We know this is our custom element type
        const currentNode = node as SlateElementType;
        // @ts-ignore - We know this contains a text property
        const text = currentNode.children[0]?.text || '';
        
        if (newType === 'scene-heading' || newType === 'character' || newType === 'transition') {
          const formattedText = newType === 'transition' && text.trim() === '' ? 
            'CUT TO:' : text.toUpperCase();
            
          Transforms.setNodes(
            editor,
            { 
              children: [{ text: formattedText }]
            } as Partial<SlateElementType>,
            { at: selection.focus.path.slice(0, 1) }
          );
        }
        return;
      }
    }
  };
  
  // Custom normalization to enforce formatting rules
  useEffect(() => {
    // Override the editor's normalizeNode function to auto-format text
    const { normalizeNode } = editor;
    
    editor.normalizeNode = ([node, path]) => {
      if (SlateElement.isElement(node) && 'type' in node) {
        const elementType = (node as SlateElementType).type;
        
        // Auto-capitalize scene headings, character names, and transitions
        if (
          elementType === 'scene-heading' || 
          elementType === 'character' || 
          elementType === 'transition'
        ) {
          // @ts-ignore - We know this is our custom element with text
          const textNode = node.children[0];
          if (textNode && typeof textNode.text === 'string') {
            const currentText = textNode.text;
            const uppercasedText = currentText.toUpperCase();
            
            if (currentText !== uppercasedText) {
              Transforms.setNodes(
                editor,
                { children: [{ text: uppercasedText }] } as Partial<SlateElementType>,
                { at: path }
              );
              return;
            }
          }
        }
      }
      
      // Fall back to the original normalization logic
      normalizeNode([node, path]);
    };
  }, [editor]);

  return (
    <div 
      className={`slate-editor ${className}`}
      style={{ 
        fontFamily: 'Courier Final Draft, Courier Prime, monospace',
        fontSize: '12pt'
      }}
    >
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
      >
        <div 
          className="script-page" 
          style={{ 
            transform: `scale(${formatState.zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          <Editable
            className="script-page-content"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            style={{ 
              fontFamily: 'Courier Final Draft, Courier Prime, monospace',
              padding: '1rem'
            }}
            placeholder="Begin typing your screenplay..."
          />
        </div>
      </Slate>
    </div>
  );
};

export default SlateEditor;
