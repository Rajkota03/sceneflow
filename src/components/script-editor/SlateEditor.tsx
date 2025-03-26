
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

const LINES_PER_PAGE = 55;
const CHARS_PER_LINE = 60;
const ELEMENT_TYPE_LINE_COUNT: Record<ElementType, number> = {
  'scene-heading': 1,
  'action': 1,
  'character': 1,
  'dialogue': 1,
  'parenthetical': 1,
  'transition': 1,
  'note': 1
};

const estimateLines = (text: string, type: ElementType): number => {
  if (!text) return 1;
  
  let width = 100;
  
  if (type === 'dialogue') width = 62;
  else if (type === 'character') width = 38;
  else if (type === 'parenthetical') width = 40;
  
  const effectiveCharsPerLine = Math.floor(CHARS_PER_LINE * (width / 100));
  
  return Math.max(1, Math.ceil(text.length / effectiveCharsPerLine));
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

  useEffect(() => {
    if (!value || value.length === 0) return;

    let currentPage: SlateElementType[] = [];
    let pages: SlateElementType[][] = [];
    let lineCount = 0;
    
    value.forEach((element, index) => {
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
      
      if (lineCount + estimatedLines > LINES_PER_PAGE && currentPage.length > 0) {
        pages.push([...currentPage]);
        currentPage = [];
        lineCount = 0;
      }
      
      currentPage.push(element);
      lineCount += estimatedLines;
    });
    
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
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
        
        const newElement = createSlateElement(newType);
        
        if (newType === 'transition') {
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
      
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        
        const pageBreakElement: SlateElementType = {
          type: 'action',
          id: uuidv4(),
          pageBreak: true,
          children: [{ text: '' }]
        };
        
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
                    lineHeight: '1.2', // Reduced line height to match Final Draft
                    cursor: 'text'
                  }}
                />
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
