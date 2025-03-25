
import { useEffect, useRef, useState } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType, ActType } from '../lib/types';
import EditorElement from './EditorElement';
import { generateUniqueId } from '../lib/formatScript';
import FormatStyler from './FormatStyler';
import { useFormat } from '@/lib/formatContext';
import TagManager from './TagManager';
import useScriptElements from '@/hooks/useScriptElements';
import useFilteredElements from '@/hooks/useFilteredElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useScriptNavigation from '@/hooks/useScriptNavigation';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './script-editor/KeyboardShortcutsHelp';
import ZoomControls from './script-editor/ZoomControls';
import { BeatMode } from '@/types/scriptTypes';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectName?: string;
  structureName?: string;
  projectId?: string;
  beatMode?: BeatMode;
}

const ScriptEditor = ({ 
  initialContent, 
  onChange, 
  notes, 
  onNoteCreate, 
  className,
  projectName = "Untitled Project",
  structureName = "Three Act Structure",
  projectId,
  beatMode = 'on'
}: ScriptEditorProps) => {
  const { formatState } = useFormat();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    changeElementType
  } = useScriptElements(initialContent, onChange);

  const { handleNavigate, handleEnterKey } = useScriptNavigation({
    elements,
    setElements,
    activeElementId,
    setActiveElementId
  });

  const characterNames = useCharacterNames(elements);
  const filteredElements = useFilteredElements(elements, activeTagFilter, activeActFilter);
  const { showKeyboardShortcuts } = useKeyboardShortcuts();

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
  }, [elements.length, setElements, setActiveElementId]);

  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  const handleFormatChange = (id: string, newType: ElementType) => {
    changeElementType(id, newType);
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

  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    const { setZoomLevel } = useFormat();
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
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
          
          {showKeyboardShortcuts && <KeyboardShortcutsHelp />}
          
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
                    projectId={projectId}
                    beatMode={beatMode}
                  />
                ))}
              </div>
            </div>
          </FormatStyler>
        </div>
      </div>
      
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={handleZoomChange}
      />
    </div>
  );
};

export default ScriptEditor;
