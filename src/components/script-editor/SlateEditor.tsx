
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms, Range, Node, Path, BaseEditor } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, useSlate, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { v4 as uuidv4 } from 'uuid';
import { SlateElementType, ElementType, ScriptElement } from '@/lib/types';
import { scriptToSlate, slateToScript, createSlateElement, createPageBreakElement } from '@/lib/slateUtils';
import { formatType } from '@/lib/formatScript';
import { useScriptEditor } from './ScriptEditorProvider';
import { Separator } from '@/components/ui/separator';

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
      textTransform: 'uppercase',
      marginBottom: '1em', // Double space after scene heading
      lineHeight: '1.2' // Reduced line height to match Final Draft
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
      marginRight: 0,
      marginBottom: '0.5em', // Single space between action paragraphs
      lineHeight: '1.2' // Reduced line height to match Final Draft
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
      textAlign: 'center',
      marginTop: '0.8em', // Reduced space before character
      marginBottom: '0', // No space between character and dialogue
      lineHeight: '1.2' // Reduced line height to match Final Draft
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
      textAlign: 'left',
      marginBottom: '0.8em', // Adjusted space after dialogue
      lineHeight: '1.2' // Reduced line height to match Final Draft
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
      textAlign: 'left',
      marginBottom: '0', // No space after parenthetical
      lineHeight: '1.2' // Reduced line height to match Final Draft
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
      textAlign: 'right',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      marginTop: '0.8em', // Adjusted space before transition
      marginBottom: '0.8em', // Adjusted space after transition
      lineHeight: '1.2' // Reduced line height to match Final Draft
    }}
  >
    {children}
  </div>
);

const Note = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="note"
    style={{ 
      width: '100%',
      lineHeight: '1.2' // Reduced line height to match Final Draft
    }}
  >
    {children}
  </div>
);

const PageBreak = ({ attributes, children }: RenderElementProps) => (
  <div 
    {...attributes} 
    className="page-break"
    style={{ 
      width: '100%',
      borderBottom: '2px dashed #999',
      margin: '20px 0',
      position: 'relative',
      userSelect: 'none',
      height: '30px',
      backgroundColor: '#f5f5f5'
    }}
  >
    <div className="page-break-text" style={{
      position: 'absolute',
      top: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'white',
      padding: '0 8px',
      color: '#666',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      border: '1px solid #ccc',
      borderRadius: '4px'
    }}>
      Page Break
    </div>
    {children}
  </div>
);

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return <span {...attributes}>{children}</span>;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: SlateElementType;
    Text: { text: string };
  }
}

// Updated constants for more accurate line counting
const LINES_PER_PAGE = 54; // Standard screenplay page has ~54 lines
const CHAR_WIDTH = {
  'scene-heading': 10,  // 10 chars per inch, full width
  'action': 10,         // 10 chars per inch, full width
  'character': 10,      // Center aligned in narrower column
  'dialogue': 7.2,      // About 36 chars per line in 5" width
  'parenthetical': 6,   // About 30 chars per line in 4" width
  'transition': 10,     // Right aligned, full width
  'note': 10            // Full width
};

// Improved line estimation function
const estimateLines = (text: string, type: ElementType): number => {
  if (!text) return 1;
  
  // Base characters per line based on element type
  const charsPerLine = {
    'scene-heading': 60,  // Full width (6.0")
    'action': 60,         // Full width (6.0")
    'character': 38,      // Character names are narrower (3.8")
    'dialogue': 45,       // Dialogue is about 4.5" wide
    'parenthetical': 34,  // Parentheticals are narrower
    'transition': 60,     // Full width
    'note': 60            // Full width
  }[type] || 60;
  
  // Split into lines by any existing line breaks
  const lines = text.split('\n');
  let totalLines = 0;
  
  // Calculate the number of lines for each paragraph
  lines.forEach(line => {
    if (line.length === 0) {
      totalLines += 1; // Empty lines count as one
    } else {
      // Calculate how many lines this paragraph takes up
      totalLines += Math.max(1, Math.ceil(line.length / charsPerLine));
    }
  });
  
  // Add additional space for certain element types
  if (type === 'scene-heading') totalLines += 1; // Scene headings take an extra line
  if (type === 'character') totalLines += 0.5;   // Add a bit of extra space for character names
  
  return Math.max(1, Math.ceil(totalLines));
};

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
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<SlateElementType[][]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [focused, setFocused] = useState(false);

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

  useEffect(() => {
    if (elements && elements.length > 0) {
      setValue(scriptToSlate(elements));
    }
  }, [elements]);

  // Improved pagination algorithm
  useEffect(() => {
    if (!value || value.length === 0) return;

    let pages: SlateElementType[][] = [];
    let currentPage: SlateElementType[] = [];
    let lineCount = 0;
    
    // Process each element for pagination
    value.forEach((element, index) => {
      // Handle explicit page breaks
      if (element.pageBreak) {
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
          lineCount = 0;
        }
        return;
      }
      
      const elementText = element.children.map(c => c.text).join('');
      const estimatedLines = estimateLines(elementText, element.type);
      
      // Check if adding this element would exceed the page limit
      if (lineCount + estimatedLines > LINES_PER_PAGE) {
        // Don't split certain element pairs (like character and dialogue)
        const shouldKeepWithNext = 
          element.type === 'character' || 
          (currentPage.length > 0 && 
            currentPage[currentPage.length - 1].type === 'character' && 
            element.type === 'dialogue');
        
        // If we should keep this element with the next, and it would fit on a new page
        if (shouldKeepWithNext && estimatedLines <= LINES_PER_PAGE) {
          pages.push([...currentPage]);
          currentPage = [element];
          lineCount = estimatedLines;
        } 
        // If we should split at this point because the page is full
        else if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [element];
          lineCount = estimatedLines;
        } 
        // If this single element is too big for an empty page, just add it anyway
        else {
          currentPage.push(element);
          lineCount += estimatedLines;
        }
      } else {
        // Element fits on current page
        currentPage.push(element);
        lineCount += estimatedLines;
      }
      
      // Add "CONT'D" to character names that span pages
      if (element.type === 'character' && index > 0) {
        // Check if the previous element of the same character is on a different page
        const prevCharacterIndex = index - 1;
        if (value[prevCharacterIndex] && value[prevCharacterIndex].type === 'character') {
          const prevCharText = value[prevCharacterIndex].children.map(c => c.text).join('');
          const currCharText = elementText;
          
          // Fixed the syntax error with the CONT'D string by using double quotes in the includes function
          if (prevCharText.replace(/\s*\(CONT'D\)$/, '') === currCharText.replace(/\s*\(CONT'D\)$/, '') && 
              !currCharText.includes("(CONT'D)")) {
            const charNameBase = currCharText.trim();
            element.children = [{ text: `${charNameBase} (CONT'D)` }];
          }
        }
      }
    });
    
    // Add the last page if there are elements left
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
    // Ensure we always have at least one page
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

  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as SlateElementType;
    
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

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const handleChange = (newValue: Descendant[]) => {
    setValue(newValue as SlateElementType[]);
    onChange(slateToScript(newValue as SlateElementType[]));
  };

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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [node] = Editor.node(editor, selection.focus.path.slice(0, 1));
      const elementType = (node as SlateElementType).type;
      
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        
        const nextType = getNextElementType(elementType);
        
        const newElement = createSlateElement(nextType);
        
        if (nextType === 'transition') {
          newElement.children = [{ text: 'CUT TO:' }];
        }
        
        Transforms.insertNodes(
          editor,
          newElement,
          { at: Path.next(selection.focus.path.slice(0, 1)) }
        );
        
        Transforms.select(editor, Path.next(selection.focus.path.slice(0, 1)));
        return;
      }
      
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        
        const elementTypes: ElementType[] = [
          'scene-heading',
          'action',
          'character',
          'dialogue',
          'parenthetical',
          'transition'
        ];
        
        const currentIndex = elementTypes.indexOf(elementType);
        const nextIndex = (currentIndex + 1) % elementTypes.length;
        
        Transforms.setNodes(
          editor,
          { type: elementTypes[nextIndex] } as Partial<SlateElementType>,
          { at: selection.focus.path.slice(0, 1) }
        );
        return;
      }
      
      if ((event.metaKey || event.ctrlKey) && !isNaN(Number(event.key)) && Number(event.key) >= 1 && Number(event.key) <= 6) {
        event.preventDefault();
        
        const typeMap: Record<number, ElementType> = {
          1: 'scene-heading',
          2: 'action',
          3: 'character',
          4: 'dialogue',
          5: 'parenthetical',
          6: 'transition'
        };
        
        const newType = typeMap[Number(event.key)];
        
        Transforms.setNodes(
          editor,
          { type: newType } as Partial<SlateElementType>,
          { at: selection.focus.path.slice(0, 1) }
        );
        
        return;
      }
      
      // Enhanced page break insertion with Ctrl+Enter
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        
        // Create a page break element
        const pageBreakElement = createPageBreakElement();
        
        // Insert the page break after the current element
        Transforms.insertNodes(
          editor,
          pageBreakElement,
          { at: Path.next(selection.focus.path.slice(0, 1)) }
        );
        
        // Add a new action element after the page break
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

  useEffect(() => {
    const { normalizeNode } = editor;
    
    editor.normalizeNode = ([node, path]) => {
      if (SlateElement.isElement(node) && 'type' in node) {
        const elementType = (node as SlateElementType).type;
        
        if (
          elementType === 'scene-heading' || 
          elementType === 'character' || 
          elementType === 'transition'
        ) {
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
      
      normalizeNode([node, path]);
    };
  }, [editor]);

  const focusEditor = useCallback(() => {
    if (!focused) {
      ReactEditor.focus(editor);
      setFocused(true);
    }
  }, [editor, focused]);

  const handleBlur = () => {
    setFocused(false);
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    focusEditor();
  };

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

  // Create a single editable component for each page
  const renderPage = (pageElements: SlateElementType[], pageIndex: number) => {
    return (
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
          cursor: 'text'
        }}
      >
        <div 
          className="absolute top-8 right-16 text-gray-700 pointer-events-none"
          style={{
            fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
            fontSize: '12pt',
          }}
        >
          {pageIndex + 1}.
        </div>
        
        <div 
          className="script-page-content"
          style={{ 
            padding: '1in 1in 1in 1.5in',
            height: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          {pageElements.map((element, elementIndex) => {
            // Render each element on the page
            const elementProps = {
              element,
              attributes: { 
                'data-slate-node': 'element',
                'data-slate-element': element.type,
                ref: null
              } as any,
              children: <div>{element.children.map(child => child.text).join('')}</div>
            };
            
            return (
              <div key={element.id || `elem-${elementIndex}`} className="slate-element">
                {renderElement(elementProps as any)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`slate-editor ${className}`}
      style={{ 
        fontFamily: 'Courier Final Draft, Courier Prime, monospace',
        fontSize: '12pt',
        lineHeight: '1.2' // Reduced line height to match Final Draft
      }}
      onClick={handleEditorClick}
    >
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
      >
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
            paddingBottom: '2in'
          }}
        >
          {/* Render the active editable area */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
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
                lineHeight: '1.2',
                cursor: 'text'
              }}
            />
          </div>
          
          {/* Render the visual representation of pages */}
          {pages.map((pageElements, pageIndex) => renderPage(pageElements, pageIndex))}
        </div>
      </Slate>
      
      <div className="text-center mt-4 text-sm text-gray-500">
        {pageCount} {pageCount === 1 ? 'page' : 'pages'}
      </div>
    </div>
  );
};

export default SlateEditor;
