
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms, Range, Node, Path, BaseEditor } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, useSlate, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { v4 as uuidv4 } from 'uuid';
import { SlateElementType, ElementType, ScriptElement } from '@/lib/types';
import { scriptToSlate, slateToScript, createSlateElement } from '@/lib/slateUtils';
import { formatType } from '@/lib/formatScript';
import { useScriptEditor } from './ScriptEditorProvider';
import { Separator } from '@/components/ui/separator';

// Define custom element renderers for script elements
const SceneHeading = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="scene-heading"
    style={{ 
      width: '100%',
      textAlign: 'left',
      marginLeft: 0,
      marginRight: 0,
      fontWeight: 'bold',
      textTransform: 'uppercase'
    }}
  >
    {children}
  </div>
);

const Action = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="action"
    style={{ 
      width: '100%', 
      textAlign: 'left',
      marginLeft: 0,
      marginRight: 0
    }}
  >
    {children}
  </div>
);

const Character = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="character"
    style={{ 
      width: '38%', 
      marginLeft: 'auto', 
      marginRight: 'auto',
      textAlign: 'center'
    }}
  >
    {children}
  </div>
);

const Dialogue = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="dialogue"
    style={{ 
      width: '62%', 
      marginLeft: 'auto', 
      marginRight: 'auto',
      textAlign: 'left'
    }}
  >
    {children}
  </div>
);

const Parenthetical = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="parenthetical"
    style={{ 
      width: '40%', 
      marginLeft: 'auto', 
      marginRight: 'auto',
      textAlign: 'left'
    }}
  >
    {children}
  </div>
);

const Transition = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="transition"
    style={{ 
      width: '100%',
      textAlign: 'right'
    }}
  >
    {children}
  </div>
);

const Note = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="note"
    style={{ width: '100%' }}
  >
    {children}
  </div>
);

// Page Break component
const PageBreak = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="page-break"
    style={{ 
      width: '100%',
      borderBottom: '1px dashed #999',
      margin: '10px 0',
      position: 'relative',
      userSelect: 'none',
      height: '20px'
    }}
  >
    <div className="page-break-text" style={{
      position: 'absolute',
      top: '-5px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'white',
      padding: '0 8px',
      color: '#999',
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      Page Break
    </div>
    {children}
  </div>
);

// Custom leaf renderer for text formatting
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return <span {...attributes}>{children}</span>;
};

// Declare custom types for Slate
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: SlateElementType;
    Text: { text: string };
  }
}

// Constants for page calculation
const LINES_PER_PAGE = 55; // Standard screenplay page has ~55 lines
const CHARS_PER_LINE = 60; // Approximate characters per line in Courier 12pt
const ELEMENT_TYPE_LINE_COUNT: Record<ElementType, number> = {
  'scene-heading': 1,
  'action': 1,      // Dynamic based on content
  'character': 1,
  'dialogue': 1,    // Dynamic based on content
  'parenthetical': 1,
  'transition': 1,
  'note': 1
};

// Estimate lines based on text length and element type
const estimateLines = (text: string, type: ElementType): number => {
  if (!text) return 1;
  
  let width = 100;
  
  // Adjust width based on element type
  if (type === 'dialogue') width = 62;
  else if (type === 'character') width = 38;
  else if (type === 'parenthetical') width = 40;
  
  // Estimate characters per line based on width percentage
  const effectiveCharsPerLine = Math.floor(CHARS_PER_LINE * (width / 100));
  
  // Calculate lines needed (round up)
  return Math.max(1, Math.ceil(text.length / effectiveCharsPerLine));
};

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
  const pagesRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<SlateElementType[][]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [focused, setFocused] = useState(false);
  
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
  
  // Calculate pages based on content
  useEffect(() => {
    if (!value || value.length === 0) return;

    let currentPage: SlateElementType[] = [];
    let pages: SlateElementType[][] = [];
    let lineCount = 0;
    
    // Process each element to determine page breaks
    value.forEach((element, index) => {
      // If element has pageBreak property, force a new page
      if (element.pageBreak) {
        // Add current page if it has content
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
          lineCount = 0;
        }
        return;
      }
      
      // Estimate lines for this element
      const elementText = element.children.map(c => c.text).join('');
      const estimatedLines = estimateLines(elementText, element.type);
      
      // If adding this element would exceed page limit, start a new page
      if (lineCount + estimatedLines > LINES_PER_PAGE && currentPage.length > 0) {
        pages.push([...currentPage]);
        currentPage = [];
        lineCount = 0;
      }
      
      // Add element to current page
      currentPage.push(element);
      lineCount += estimatedLines;
    });
    
    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
    // Ensure at least one page
    if (pages.length === 0) {
      pages = [[
        {
          id: uuidv4(),
          type: 'action',
          children: [{ text: '' }],
        } as SlateElementType
      ]];
    }
    
    setPages(pages);
    setPageCount(pages.length);
  }, [value]);
  
  // Define a rendering function for each element type
  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as SlateElementType;
    
    // Handle page breaks as a special case
    if (element.pageBreak) {
      return <PageBreak {...props} />;
    }
    
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
        return 'action';
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
      // Get the current node at selection
      const [node] = Editor.node(editor, selection.focus.path.slice(0, 1));
      // Extract the element type, using type assertion for TypeScript
      const elementType = (node as SlateElementType).type;
      
      // Handle Enter key
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        
        // Get the next element type based on the current one
        const nextType = getNextElementType(elementType);
        
        // Insert a new element with the appropriate type
        const newElement = createSlateElement(nextType);
        
        // For transitions, add default text
        if (nextType === 'transition') {
          newElement.children = [{ text: 'CUT TO:' }];
        }
        
        Transforms.insertNodes(
          editor,
          newElement,
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
        
        // Instead of changing the current element type, create a new element of the desired type
        const newElement = createSlateElement(newType);
        
        // For transitions, add default text
        if (newType === 'transition') {
          newElement.children = [{ text: 'CUT TO:' }];
        }
        
        // Insert the new element after the current one
        Transforms.insertNodes(
          editor,
          newElement,
          { at: Path.next(selection.focus.path.slice(0, 1)) }
        );
        
        // Move the selection to the new element
        Transforms.select(editor, Path.next(selection.focus.path.slice(0, 1)));
        
        return;
      }
      
      // Add shortcut for page break (Ctrl/Cmd + Enter)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        
        // Create a page break element
        const pageBreakElement: SlateElementType = {
          type: 'action',
          id: uuidv4(),
          pageBreak: true,
          children: [{ text: '' }]
        };
        
        // Insert the page break after the current element
        Transforms.insertNodes(
          editor,
          pageBreakElement,
          { at: Path.next(selection.focus.path.slice(0, 1)) }
        );
        
        // Insert a new action element after the page break
        const newActionElement = createSlateElement('action');
        Transforms.insertNodes(
          editor,
          newActionElement,
          { at: Path.next(Path.next(selection.focus.path.slice(0, 1))) }
        );
        
        // Move selection to the new action element
        Transforms.select(editor, Path.next(Path.next(selection.focus.path.slice(0, 1))));
        
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

  // Set focus on the editor when it mounts or the user clicks on it
  const focusEditor = useCallback(() => {
    if (!focused) {
      ReactEditor.focus(editor);
      setFocused(true);
    }
  }, [editor, focused]);

  // Reset focus state when user clicks away
  const handleBlur = () => {
    setFocused(false);
  };

  // Add click handler to focus the editor
  const handleEditorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    focusEditor();
  };

  // Focus the editor on initial load
  useEffect(() => {
    setTimeout(() => {
      try {
        ReactEditor.focus(editor);
        setFocused(true);
      } catch (error) {
        console.error("Failed to focus editor:", error);
      }
    }, 100);
  }, [editor]);

  return (
    <div 
      className={`slate-editor ${className}`}
      style={{ 
        fontFamily: 'Courier Final Draft, Courier Prime, monospace',
        fontSize: '12pt'
      }}
      onClick={handleEditorClick}
    >
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
      >
        {/* Visible pages container with proper scaling */}
        <div 
          className="pages-container mt-4" 
          ref={pagesRef}
          style={{ 
            transform: `scale(${formatState.zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '2in' // Extra space at the bottom
          }}
        >
          {/* Render editable pages */}
          {pages.map((pageElements, pageIndex) => (
            <div 
              key={`page-${pageIndex}`} 
              className="script-page mb-8 relative"
              style={{ 
                width: '8.5in',
                height: '11in',
                backgroundColor: 'white',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '0.5in',
                pageBreakAfter: 'always',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'text' // Show text cursor on the page
              }}
            >
              {/* Page number */}
              <div 
                className="absolute top-8 right-16 text-gray-700 pointer-events-none"
                style={{
                  fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
                  fontSize: '12pt',
                }}
              >
                {pageIndex + 1}.
              </div>
              
              {/* Page content container with proper margins */}
              <div 
                className="script-page-content"
                style={{ 
                  padding: '1in 1in 1in 1.5in', /* Top, Right, Bottom, Left - standard screenplay margins */
                  height: '100%',
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }}
              >
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  spellCheck={false}
                  className="h-full outline-none"
                  style={{
                    fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
                    fontSize: '12pt',
                    lineHeight: '1.5',
                    cursor: 'text'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Slate>
      
      {/* Page count indicator */}
      <div className="text-center mt-4 text-sm text-gray-500">
        {pageCount} {pageCount === 1 ? 'page' : 'pages'}
      </div>
    </div>
  );
};

export default SlateEditor;
