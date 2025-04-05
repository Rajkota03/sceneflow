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
      marginBottom: '1em', 
      lineHeight: '1.2'
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
      marginBottom: '0.5em',
      lineHeight: '1.2'
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
      marginTop: '0.8em',
      marginBottom: '0',
      lineHeight: '1.2'
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
      marginBottom: '0.8em',
      lineHeight: '1.2'
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
      marginBottom: '0',
      lineHeight: '1.2'
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
      marginTop: '0.8em',
      marginBottom: '0.8em',
      lineHeight: '1.2'
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
      lineHeight: '1.2'
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

const LINES_PER_PAGE = 54; // Standard screenplay page has ~54 lines

const estimateLines = (text: string, type: ElementType): number => {
  if (!text) return 1;
  
  const charsPerLine = {
    'scene-heading': 60,
    'action': 60,
    'character': 38,
    'dialogue': 45,
    'parenthetical': 34,
    'transition': 60,
    'note': 60
  }[type] || 60;
  
  const lines = text.split('\n');
  let totalLines = 0;
  
  lines.forEach(line => {
    if (line.length === 0) {
      totalLines += 1;
    } else {
      totalLines += Math.max(1, Math.ceil(line.length / charsPerLine));
    }
  });
  
  if (type === 'scene-heading') totalLines += 1;
  if (type === 'character') totalLines += 0.5;
  
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
  const [value, setValue] = useState<SlateElementType[]>([]);
  const [pages, setPages] = useState<SlateElementType[][]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [focused, setFocused] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elements && elements.length > 0) {
      const slateElements = scriptToSlate(elements);
      setValue(slateElements);
    } else {
      const defaultElements = scriptToSlate([
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
      setValue(defaultElements);
    }
  }, [elements]);

  useEffect(() => {
    if (!value || value.length === 0) return;

    const paginatedContent: SlateElementType[][] = [];
    let currentPage: SlateElementType[] = [];
    let lineCount = 0;
    
    value.forEach((element, index) => {
      if (element.pageBreak) {
        if (currentPage.length > 0) {
          paginatedContent.push([...currentPage]);
          currentPage = [];
          lineCount = 0;
        }
        return;
      }
      
      const elementText = element.children.map(c => c.text).join('');
      const estimatedLines = estimateLines(elementText, element.type);
      
      if (lineCount + estimatedLines > LINES_PER_PAGE) {
        const shouldKeepWithNext = 
          element.type === 'character' || 
          (currentPage.length > 0 && 
           currentPage[currentPage.length - 1].type === 'character' && 
           element.type === 'dialogue');
        
        if (shouldKeepWithNext && estimatedLines <= LINES_PER_PAGE) {
          paginatedContent.push([...currentPage]);
          currentPage = [element];
          lineCount = estimatedLines;
        } 
        else if (currentPage.length > 0) {
          paginatedContent.push([...currentPage]);
          currentPage = [element];
          lineCount = estimatedLines;
        } 
        else {
          currentPage.push(element);
          lineCount += estimatedLines;
        }
      } else {
        currentPage.push(element);
        lineCount += estimatedLines;
      }
      
      if (element.type === 'character' && index > 0) {
        const prevCharacterIndex = index - 1;
        if (value[prevCharacterIndex] && value[prevCharacterIndex].type === 'character') {
          const prevCharText = value[prevCharacterIndex].children.map(c => c.text).join('');
          const currCharText = elementText;
          
          if (prevCharText.replace(/\s*\(CONT'D\)$/, '') === currCharText.replace(/\s*\(CONT'D\)$/, '') && 
              !currCharText.includes("(CONT'D)")) {
            const charNameBase = currCharText.trim();
            element.children = [{ text: `${charNameBase} (CONT'D)` }];
          }
        }
      }
    });
    
    if (currentPage.length > 0) {
      paginatedContent.push(currentPage);
    }
    
    if (paginatedContent.length === 0) {
      paginatedContent.push([{
        id: uuidv4(),
        type: 'action',
        children: [{ text: '' }],
      } as SlateElementType]);
    }
    
    setPages(paginatedContent);
    setPageCount(paginatedContent.length);
  }, [value]);

  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as SlateElementType;
    
    if (element.pageBreak) {
      return <PageBreak {...props} />;
    }
    
    switch (element.type) {
      case 'scene-heading': return <SceneHeading {...props} />;
      case 'action': return <Action {...props} />;
      case 'character': return <Character {...props} />;
      case 'dialogue': return <Dialogue {...props} />;
      case 'parenthetical': return <Parenthetical {...props} />;
      case 'transition': return <Transition {...props} />;
      case 'note': return <Note {...props} />;
      default: return <Action {...props} />;
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
      case 'scene-heading': return 'action';
      case 'action': return 'action';
      case 'character': return 'dialogue';
      case 'dialogue': return 'action';
      case 'parenthetical': return 'dialogue';
      case 'transition': return 'scene-heading';
      default: return 'action';
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
      
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        
        const pageBreakElement = createPageBreakElement();
        
        Transforms.insertNodes(
          editor,
          pageBreakElement,
          { at: Path.next(selection.focus.path.slice(0, 1)) }
        );
        
        const newActionElement = createSlateElement('action');
        Transforms.insertNodes(
          editor,
          newActionElement,
          { at: Path.next(Path.next(selection.focus.path.slice(0, 1))) }
        );
        
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

  const handleEditorClick = () => {
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

  const handlePageClick = (pageIndex: number, elementIndex: number) => {
    setActivePageIndex(pageIndex);
    
    let globalElementIndex = elementIndex;
    for (let i = 0; i < pageIndex; i++) {
      globalElementIndex += pages[i].length;
    }
    
    try {
      const path = [globalElementIndex, 0];
      Transforms.select(editor, { path, offset: 0 });
      ReactEditor.focus(editor);
    } catch (error) {
      console.error("Failed to set selection:", error);
    }
  };

  return (
    <div 
      className={`slate-editor ${className}`}
      style={{ 
        fontFamily: 'Courier Final Draft, Courier Prime, monospace',
        fontSize: '12pt',
        lineHeight: '1.2',
        position: 'relative'
      }}
      onClick={handleEditorClick}
    >
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          spellCheck={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 1,
            zIndex: 10,
            cursor: 'text',
            caretColor: 'black',
            height: '100%',
            width: '100%',
            padding: '1rem'
          }}
        />

        <div 
          className="pages-container mt-4"
          style={{ 
            transform: `scale(${formatState.zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '2in',
            position: 'relative',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          {pages.map((pageElements, pageIndex) => (
            <div 
              key={`page-${pageIndex}`} 
              className={`script-page mb-8 relative ${pageIndex === activePageIndex ? 'ring-2 ring-blue-400' : ''}`}
              style={{ 
                width: '8.5in',
                height: '11in',
                backgroundColor: 'white',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '0.5in',
                pageBreakAfter: 'always',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'text',
                pointerEvents: 'none'
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
                  boxSizing: 'border-box',
                  pointerEvents: 'none'
                }}
              >
                {pageElements.map((element, elementIndex) => {
                  const elementProps = {
                    element,
                    attributes: {
                      'data-slate-node': 'element',
                      'data-element-index': elementIndex,
                      'data-page-index': pageIndex,
                    } as any,
                    children: <div>{element.children.map(child => child.text).join('')}</div>
                  };
                  
                  return (
                    <div 
                      key={element.id || `elem-${elementIndex}`} 
                      className="slate-element"
                    >
                      {renderElement(elementProps as any)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Slate>
      
      <div className="text-center mt-4 text-sm text-gray-500">
        {pageCount} {pageCount === 1 ? 'page' : 'pages'}
      </div>
    </div>
  );
};

export default SlateEditor;
