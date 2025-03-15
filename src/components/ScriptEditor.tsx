import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType, ActType } from '../lib/types';
import EditorElement from './EditorElement';
import { generateUniqueId } from '../lib/formatScript';
import FormatStyler from './FormatStyler';
import { useFormat } from '@/lib/formatContext';
import { addContdToCharacter, shouldAddContd } from '@/lib/characterUtils';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';
import TagManager from './TagManager';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectName?: string;
  structureName?: string;
}

const ScriptEditor = ({ 
  initialContent, 
  onChange, 
  notes, 
  onNoteCreate, 
  className,
  projectName = "Untitled Project",
  structureName = "Three Act Structure"
}: ScriptEditorProps) => {
  const { formatState, zoomIn, zoomOut, resetZoom } = useFormat();
  const [elements, setElements] = useState<ScriptElement[]>(initialContent.elements || []);
  const [activeElementId, setActiveElementId] = useState<string | null>(
    elements.length > 0 ? elements[0].id : null
  );
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [filteredElements, setFilteredElements] = useState<ScriptElement[]>(elements);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange({ elements });
  }, [elements, onChange]);

  useEffect(() => {
    if (!activeTagFilter && !activeActFilter) {
      setFilteredElements(elements);
      return;
    }

    let filtered = [...elements];
    
    // Tag-based filtering
    if (activeTagFilter) {
      const filteredIds = new Set<string>();
      let includeNext = false;
      
      elements.forEach((element) => {
        if (element.type === 'scene-heading') {
          if (element.tags?.includes(activeTagFilter)) {
            filteredIds.add(element.id);
            includeNext = true;
          } else {
            includeNext = false;
          }
        } else if (includeNext) {
          filteredIds.add(element.id);
        }
      });
      
      filtered = elements.filter(element => filteredIds.has(element.id));
    }
    
    // Act-based filtering
    if (activeActFilter) {
      const filteredIds = new Set<string>();
      let includeNext = false;
      
      elements.forEach((element) => {
        if (element.type === 'scene-heading') {
          // Check if any tag in this scene matches the selected act
          const matchesAct = element.tags?.some(tag => {
            if (activeActFilter === 1) return tag.startsWith('Act 1:');
            if (activeActFilter === '2A') return tag.startsWith('Act 2A:');
            if (activeActFilter === 'midpoint') return tag.startsWith('Midpoint:');
            if (activeActFilter === '2B') return tag.startsWith('Act 2B:');
            if (activeActFilter === 3) return tag.startsWith('Act 3:');
            return false;
          });
          
          if (matchesAct) {
            filteredIds.add(element.id);
            includeNext = true;
          } else {
            includeNext = false;
          }
        } else if (includeNext) {
          filteredIds.add(element.id);
        }
      });
      
      filtered = elements.filter(element => filteredIds.has(element.id));
    }
    
    setFilteredElements(filtered);
  }, [elements, activeTagFilter, activeActFilter]);

  useEffect(() => {
    const names = elements
      .filter(el => el.type === 'character')
      .map(el => el.text.replace(/\s*\(CONT'D\)\s*$/, '').trim())
      .filter((name, index, self) => 
        name && self.indexOf(name) === index
      );
    
    setCharacterNames(names);
  }, [elements]);

  useEffect(() => {
    if (!elements || elements.length === 0) {
      console.log("No elements found, creating default elements");
      const defaultElements: ScriptElement[] = [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: generateUniqueId(),
          type: 'action',
          text: 'Type your action here...'
        }
      ];
      setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements]);

  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    const { formatState: currentState, setZoomLevel } = useFormat();
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  };

  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index <= 0) return undefined;
    return elements[index - 1].type;
  };

  const handleElementChange = (id: string, text: string, type: ElementType) => {
    setElements(prevElements => 
      prevElements.map(element => 
        element.id === id ? { ...element, text, type } : element
      )
    );
  };

  const handleFormatChange = (id: string, newType: ElementType) => {
    setElements(prevElements => {
      const index = prevElements.findIndex(el => el.id === id);
      if (index === -1) return prevElements;
      
      let updatedElements = [...prevElements];
      let updatedElement = { ...updatedElements[index], type: newType };
      
      if (newType === 'character') {
        updatedElement.text = addContdToCharacter(updatedElement.text, index, prevElements);
      }
      
      updatedElements[index] = updatedElement;
      return updatedElements;
    });
  };

  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    const currentElement = elements[currentIndex];
    
    if (shiftKey && currentElement.type === 'dialogue') {
      const updatedElements = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
    let nextType: ElementType;
    switch (currentElement.type) {
      case 'scene-heading':
        nextType = 'action';
        break;
      case 'character':
        nextType = 'dialogue';
        break;
      case 'dialogue':
        nextType = 'action';
        break;
      case 'parenthetical':
        nextType = 'dialogue';
        break;
      case 'transition':
        nextType = 'scene-heading';
        break;
      default:
        nextType = 'action';
    }
    
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: nextType,
      text: ''
    };
    
    if (nextType === 'character' as ElementType) {
      let prevCharIndex = -1;
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (elements[i].type === 'character') {
          prevCharIndex = i;
          break;
        }
      }
      
      if (prevCharIndex !== -1) {
        const charName = elements[prevCharIndex].text.replace(/\s*\(CONT'D\)\s*$/, '');
        if (shouldAddContd(charName, currentIndex + 1, [...elements, newElement])) {
          newElement.text = `${charName} (CONT'D)`;
        } else {
          newElement.text = charName;
        }
      }
    }
    
    const updatedElements = [
      ...elements.slice(0, currentIndex + 1),
      newElement,
      ...elements.slice(currentIndex + 1)
    ];
    
    setElements(updatedElements);
    setActiveElementId(newElement.id);
  };

  const handleNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  const handleTagsChange = (elementId: string, tags: string[]) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, tags } : element
      )
    );
  };

  const handleFilterByTag = (tag: string | null) => {
    setActiveTagFilter(tag);
    if (tag !== null) {
      setActiveActFilter(null);
    }
  };

  const handleFilterByAct = (act: ActType | null) => {
    setActiveActFilter(act);
  };

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <div 
        className="flex justify-center w-full h-full overflow-auto"
        ref={editorRef}
      >
        <div className="w-full max-w-4xl mx-auto">
          {/* Tag manager with Act Bar for filtering scenes */}
          <TagManager 
            scriptContent={{ elements }} 
            onFilterByTag={handleFilterByTag}
            onFilterByAct={handleFilterByAct}
            activeFilter={activeTagFilter}
            activeActFilter={activeActFilter}
            projectName={projectName}
            structureName={structureName}
          />
          
          <FormatStyler currentPage={currentPage}>
            <div className="script-page" style={{ 
              transform: `scale(${formatState.zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
              fontFamily: 'Courier Final Draft, Courier Prime, monospace'
            }}>
              <div className="script-page-content" style={{
                fontFamily: 'Courier Final Draft, Courier Prime, monospace',
                fontSize: '12pt',
                position: 'relative'
              }}>
                {/* Page number now positioned inside the page */}
                <div className="page-number absolute top-4 right-12 text-gray-700 font-bold text-sm z-10" style={{
                  fontFamily: "Courier Final Draft, Courier Prime, monospace",
                  fontSize: "12pt",
                }}>
                  {currentPage}
                </div>
                
                {filteredElements.map((element, index) => (
                  <EditorElement
                    key={element.id}
                    element={element}
                    previousElementType={getPreviousElementType(
                      activeTagFilter || activeActFilter
                        ? filteredElements.findIndex(el => el.id === element.id) - 1
                        : index - 1
                    )}
                    onChange={handleElementChange}
                    onFocus={() => handleFocus(element.id)}
                    isActive={activeElementId === element.id}
                    onNavigate={handleNavigate}
                    onEnterKey={handleEnterKey}
                    onFormatChange={handleFormatChange}
                    onTagsChange={handleTagsChange}
                    characterNames={characterNames}
                  />
                ))}
              </div>
            </div>
          </FormatStyler>
        </div>
      </div>
      
      {/* Zoom slider control */}
      <div className="zoom-control flex items-center justify-center space-x-4 py-2 px-4 bg-gray-100 border-t border-gray-200 absolute bottom-0 left-0 right-0">
        <ZoomOut 
          size={18} 
          className="text-gray-600 cursor-pointer" 
          onClick={zoomOut}
        />
        <div className="w-64">
          <Slider
            defaultValue={[formatState.zoomLevel * 100]}
            min={50}
            max={150}
            step={5}
            value={[zoomPercentage]}
            onValueChange={handleZoomChange}
            className="w-full"
          />
        </div>
        <ZoomIn 
          size={18} 
          className="text-gray-600 cursor-pointer" 
          onClick={zoomIn}
        />
        <span className="text-xs text-gray-600 min-w-[40px] text-center">
          {zoomPercentage}%
        </span>
      </div>
    </div>
  );
};

export default ScriptEditor;
