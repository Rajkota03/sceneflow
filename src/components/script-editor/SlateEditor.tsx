import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms, Range, Node, Path, BaseEditor } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, useSlate, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { v4 as uuidv4 } from 'uuid';
import { SlateElementType, ElementType, ScriptElement } from '@/lib/types';
import { scriptToSlate, slateToScript, createSlateElement } from '@/lib/slateUtils';
import { formatType } from '@/lib/formatScript';
import { useScriptEditor } from './ScriptEditorProvider';

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

// Custom leaf renderer for text formatting
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  // Add more styling here for future formatting options
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

// Constants for page dimensions (in pixels)
const PAGE_HEIGHT = 1056; // 11 inches at 96 DPI
const PAGE_MARGINS = {
  top: 96,    // 1 inch top margin
  bottom: 96, // 1 inch bottom margin
  left: 144,  // 1.5 inch left margin (standard for screenplay)
  right: 96   // 1 inch right margin
};
const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGINS.top - PAGE_MARGINS.bottom;

// Element continuation markers
const MORE_MARKER = "(MORE)";
const CONTD_MARKER = "(CONT'D)";

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
  
  console.log("SlateEditor rendering with", elements?.length || 0, "elements");
  
  // Convert script elements to Slate's format for the initial state
  const initialValue = useMemo(() => {
    console.log("Converting script elements to Slate format", elements?.length || 0);
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
  const [pages, setPages] = useState<SlateElementType[][]>([[]]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update value when elements change from parent
  useEffect(() => {
    if (elements && elements.length > 0) {
      console.log("Updating Slate value from new elements prop", elements.length);
      const newValue = scriptToSlate(elements);
      setValue(newValue);
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
  
  // Calculate pagination
  useEffect(() => {
    if (!containerRef.current || value.length === 0) return;
    
    // We need to defer pagination calculation to ensure elements are rendered
    const timer = setTimeout(() => {
      calculatePagination();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value, formatState.zoomLevel]);
  
  // Function to calculate pagination
  const calculatePagination = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const elementNodes = container.querySelectorAll('.element-container');
    
    let currentPage: SlateElementType[] = [];
    let currentPageHeight = 0;
    const newPages: SlateElementType[][] = [];
    
    // Track elements that should stay together (dialogue blocks)
    let dialogueBlock: SlateElementType[] = [];
    let isInDialogueBlock = false;
    let dialogueBlockHeight = 0;
    
    // Helper to add a page
    const addPage = () => {
      if (currentPage.length > 0) {
        newPages.push([...currentPage]);
        currentPage = [];
        currentPageHeight = 0;
      }
    };
    
    // Process each element
    value.forEach((element, index) => {
      const elementNode = elementNodes[index] as HTMLElement;
      if (!elementNode) return;
      
      const elementHeight = elementNode.offsetHeight;
      
      // Check if this is part of a dialogue block (character + dialogue + optional parenthetical)
      const isDialogueElement = element.type === 'character' || 
                                element.type === 'dialogue' || 
                                element.type === 'parenthetical';
      
      // Start a new dialogue block if this is a character
      if (element.type === 'character') {
        // If we were already in a dialogue block, add it to the current page
        if (isInDialogueBlock) {
          dialogueBlock.forEach(el => currentPage.push(el));
          currentPageHeight += dialogueBlockHeight;
          dialogueBlock = [];
        }
        
        isInDialogueBlock = true;
        dialogueBlock = [element];
        dialogueBlockHeight = elementHeight;
        return;
      }
      
      // Add to existing dialogue block
      if (isInDialogueBlock && isDialogueElement) {
        dialogueBlock.push(element);
        dialogueBlockHeight += elementHeight;
        
        // End dialogue block if this is the last dialogue element
        if (element.type === 'dialogue' && 
            (index === value.length - 1 || value[index + 1].type !== 'parenthetical')) {
          
          // Check if dialogue block fits on current page
          if (currentPageHeight + dialogueBlockHeight <= CONTENT_HEIGHT) {
            // Add dialogue block to current page
            dialogueBlock.forEach(el => currentPage.push(el));
            currentPageHeight += dialogueBlockHeight;
          } else {
            // Dialogue block doesn't fit - add current page and start a new one with dialogue block
            addPage();
            dialogueBlock.forEach(el => currentPage.push(el));
            currentPageHeight = dialogueBlockHeight;
          }
          
          // Reset dialogue block
          isInDialogueBlock = false;
          dialogueBlock = [];
          dialogueBlockHeight = 0;
        }
        return;
      }
      
      // Regular element (not part of dialogue block)
      if (!isInDialogueBlock) {
        // Check if element fits on current page
        if (currentPageHeight + elementHeight <= CONTENT_HEIGHT) {
          currentPage.push(element);
          currentPageHeight += elementHeight;
        } else {
          // Element doesn't fit - add current page and start a new one
          addPage();
          currentPage.push(element);
          currentPageHeight = elementHeight;
        }
      }
    });
    
    // Add any remaining elements
    if (isInDialogueBlock && dialogueBlock.length > 0) {
      if (currentPageHeight + dialogueBlockHeight <= CONTENT_HEIGHT) {
        dialogueBlock.forEach(el => currentPage.push(el));
      } else {
        addPage();
        dialogueBlock.forEach(el => currentPage.push(el));
      }
    }
    
    // Add final page
    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }
    
    // Update pages state
    setPages(newPages);
  };

  // Handle content changes
  const handleChange = (newValue: Descendant[]) => {
    console.log("Slate editor value changed");
    setValue(newValue as SlateElementType[]);
    
    // Convert Slate document to script elements and notify parent
    const scriptElements = slateToScript(newValue as SlateElementType[]);
    console.log("Converting Slate value to script elements", scriptElements.length);
    
    // Only trigger onChange if we have elements to prevent loops
    if (scriptElements.length > 0) {
      onChange(scriptElements);
    }
  };
  
  // Get the next element type based on the current one
  // Fixed to return 'action' after an action element
  const getNextElementType = (currentType: ElementType): ElementType => {
    switch (currentType) {
      case 'scene-heading':
        return 'action';
      case 'action':
        // IMPORTANT: Action always followed by action
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
      ref={containerRef}
    >
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
      >
        <div className="script-pages">
          {pages.map((pageElements, pageIndex) => (
            <div 
              key={`page-${pageIndex}`}
              className="script-page" 
              style={{ 
                width: '8.5in',
                height: '11in',
                margin: '0 auto 30px auto',
                padding: `${PAGE_MARGINS.top}px ${PAGE_MARGINS.right}px ${PAGE_MARGINS.bottom}px ${PAGE_MARGINS.left}px`,
                backgroundColor: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                transform: `scale(${formatState.zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out',
                fontFamily: 'Courier Final Draft, Courier Prime, monospace',
                fontSize: '12pt'
              }}
            >
              {/* Page number */}
              <div 
                className="page-number" 
                style={{
                  position: 'absolute',
                  top: '0.5in',
                  right: '1in',
                  fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
                  fontSize: '12pt',
                }}
              >
                {pageIndex + 1}.
              </div>

              {/* Render editable content */}
              <Editable
                className="script-page-content"
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                style={{ 
                  fontFamily: 'Courier Final Draft, Courier Prime, monospace',
                  height: '100%',
                  overflow: 'visible'
                }}
                placeholder="Begin typing your screenplay..."
              />
            </div>
          ))}
        </div>
      </Slate>
    </div>
  );
};

export default SlateEditor;
