
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType } from '../lib/types';
import EditorElement from './EditorElement';
import { generateUniqueId } from '../lib/formatScript';
import FormatStyler from './FormatStyler';
import { useFormat } from '@/lib/formatContext';
import { addContdToCharacter, shouldAddContd } from '@/lib/characterUtils';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
}

const ScriptEditor = ({ initialContent, onChange, notes, onNoteCreate, className }: ScriptEditorProps) => {
  const { formatState, zoomIn, zoomOut, resetZoom } = useFormat();
  const [elements, setElements] = useState<ScriptElement[]>(initialContent.elements || []);
  const [activeElementId, setActiveElementId] = useState<string | null>(
    elements.length > 0 ? elements[0].id : null
  );
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync elements with parent component
  useEffect(() => {
    onChange({ elements });
  }, [elements, onChange]);

  // Extract character names from elements
  useEffect(() => {
    const names = elements
      .filter(el => el.type === 'character')
      .map(el => el.text.replace(/\s*\(CONT'D\)\s*$/, '').trim()) // Remove (CONT'D) for storage
      .filter((name, index, self) => 
        name && self.indexOf(name) === index  // Only include unique names
      );
    
    setCharacterNames(names);
  }, [elements]);

  // Create default elements if empty
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

  // Calculate the zoom percentage for display
  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  // Handle zoom slider change
  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    // Update the format context with the new zoom level
    const { formatState: currentState, setZoomLevel } = useFormat();
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  };

  // Get the previous element type for contextual formatting
  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index <= 0) return undefined;
    return elements[index - 1].type;
  };

  // Handle element text and type changes
  const handleElementChange = (id: string, text: string, type: ElementType) => {
    setElements(prevElements => 
      prevElements.map(element => 
        element.id === id ? { ...element, text, type } : element
      )
    );
  };

  // Handle element type changes (manual formatting)
  const handleFormatChange = (id: string, newType: ElementType) => {
    setElements(prevElements => {
      const index = prevElements.findIndex(el => el.id === id);
      if (index === -1) return prevElements;
      
      let updatedElements = [...prevElements];
      let updatedElement = { ...updatedElements[index], type: newType };
      
      // Add (CONT'D) when appropriate for character elements
      if (newType === 'character') {
        updatedElement.text = addContdToCharacter(updatedElement.text, index, prevElements);
      }
      
      updatedElements[index] = updatedElement;
      return updatedElements;
    });
  };

  // Handle Enter key press
  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    const currentElement = elements[currentIndex];
    
    // Handle Shift+Enter for dialogue (creates a line break instead of new element)
    if (shiftKey && currentElement.type === 'dialogue') {
      const updatedElements = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
    // Determine the next element's type based on screenplay logic
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
    
    // Create a new element
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: nextType,
      text: ''
    };
    
    // Handle character continuation if this is a character element
    if (nextType === 'character' as ElementType) {
      // Find the previous character
      let prevCharIndex = -1;
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (elements[i].type === 'character') {
          prevCharIndex = i;
          break;
        }
      }
      
      // Check if we should add CONT'D
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

  // Handle navigation between elements
  const handleNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };

  // Handle focus on element
  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <div 
        className="flex justify-center w-full h-full overflow-auto"
        ref={editorRef}
      >
        <FormatStyler currentPage={currentPage}>
          <div className="script-page" style={{ 
            transform: `scale(${formatState.zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
            fontFamily: 'Courier Final Draft, Courier Prime, monospace'
          }}>
            <div className="script-page-content" style={{
              fontFamily: 'Courier Final Draft, Courier Prime, monospace',
              fontSize: '12pt'
            }}>
              {elements.map((element, index) => (
                <EditorElement
                  key={element.id}
                  element={element}
                  previousElementType={getPreviousElementType(index)}
                  onChange={handleElementChange}
                  onFocus={() => handleFocus(element.id)}
                  isActive={activeElementId === element.id}
                  onNavigate={handleNavigate}
                  onEnterKey={handleEnterKey}
                  onFormatChange={handleFormatChange}
                  characterNames={characterNames}
                />
              ))}
            </div>
          </div>
        </FormatStyler>
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
