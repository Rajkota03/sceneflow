
import { useEffect, useRef, useState } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType, ActType, Structure } from '@/lib/types';
import EditorElement from '../EditorElement';
import { generateUniqueId } from '@/lib/formatScript';
import FormatStyler from '../FormatStyler';
import { useFormat } from '@/lib/formatContext';
import TagManager from '../TagManager';
import useScriptElements from '@/hooks/useScriptElements';
import useFilteredElements from '@/hooks/useFilteredElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useScriptNavigation from '@/hooks/useScriptNavigation';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import ZoomControls from './ZoomControls';
import { BeatMode } from '@/types/scriptTypes';
import ScriptEditorProvider, { useScriptEditor as useScriptEditorHook } from './ScriptEditorProvider';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectName?: string;
  structureName?: string;
  projectId?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
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
  selectedStructureId,
  onStructureChange,
  beatMode = 'on',
  onToggleBeatMode
}: ScriptEditorProps) => {
  // Wrap the editor content in the provider for context access
  return (
    <ScriptEditorProvider
      initialContent={initialContent}
      onChange={onChange}
      projectId={projectId}
      selectedStructureId={selectedStructureId}
      onStructureChange={onStructureChange}
      beatMode={beatMode}
      onToggleBeatMode={onToggleBeatMode}
    >
      <ScriptEditorContent 
        className={className}
        projectName={projectName}
        structureName={structureName}
      />
    </ScriptEditorProvider>
  );
};

interface ScriptEditorContentProps {
  className?: string;
  projectName?: string;
  structureName?: string;
}

const ScriptEditorContent = ({ 
  className,
  projectName,
  structureName 
}: ScriptEditorContentProps) => {
  const { formatState } = useFormat();
  const [currentPage, setCurrentPage] = useState(1);
  const editorRef = useRef<HTMLDivElement>(null);
  const { showKeyboardShortcuts } = useKeyboardShortcuts();
  
  const {
    elements,
    activeElementId,
    setActiveElementId,
    activeTagFilter,
    setActiveTagFilter,
    activeActFilter,
    setActiveActFilter,
    beatMode,
    setBeatMode,
    handleElementChange,
    getPreviousElementType,
    handleNavigate,
    handleEnterKey,
    changeElementType,
    handleTagsChange,
    characterNames,
    filteredElements,
    selectedStructure,
    handleBeatTag
  } = useScriptEditor();

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
      // Use context function from ScriptEditorProvider
      const scriptEditorContext = useScriptEditor();
      scriptEditorContext.setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements.length, setActiveElementId]);

  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  const handleFormatChange = (id: string, newType: ElementType) => {
    changeElementType(id, newType);
  };

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  // Function to handle editor container click
  const handleEditorClick = (e: React.MouseEvent) => {
    // If clicking on the editor background and not an element, 
    // focus the last element or the first one
    if (e.target === editorRef.current && elements.length > 0) {
      const lastElementId = elements[elements.length - 1].id;
      setActiveElementId(lastElementId);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <div 
        className="flex justify-center w-full h-full overflow-auto"
        ref={editorRef}
        onClick={handleEditorClick}
        tabIndex={-1} // Make the container focusable but not in tab sequence
      >
        <div className="w-full max-w-4xl mx-auto">
          {/* Tag manager with Act Bar for filtering scenes */}
          <TagManager 
            scriptContent={{ elements }} 
            onFilterByTag={setActiveTagFilter}
            onFilterByAct={setActiveActFilter}
            activeFilter={activeTagFilter}
            activeActFilter={activeActFilter}
            projectName={projectName}
            structureName={structureName}
            beatMode={beatMode}
            onToggleBeatMode={setBeatMode}
          />
          
          {showKeyboardShortcuts && <KeyboardShortcutsHelp />}
          
          <FormatStyler currentPage={currentPage}>
            <div className="script-page" style={{ 
              transform: `scale(${formatState.zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
              fontFamily: 'Courier Final Draft, Courier Prime, monospace'
            }}>
              <div 
                className="script-page-content" 
                style={{
                  fontFamily: 'Courier Final Draft, Courier Prime, monospace',
                  fontSize: '12pt',
                  position: 'relative',
                  minHeight: '300px' // Ensure there's clickable area even with few elements
                }}
              >
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
                    beatMode={beatMode}
                    selectedStructure={selectedStructure}
                    onBeatTag={handleBeatTag}
                  />
                ))}
              </div>
            </div>
          </FormatStyler>
        </div>
      </div>
      
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={(value) => {
          const newZoomLevel = value[0] / 100;
          // Use the format context method directly
          if (formatState.setZoomLevel) {
            formatState.setZoomLevel(newZoomLevel);
          }
        }}
      />
    </div>
  );
};

export default ScriptEditor;

function useScriptEditor() {
  return useScriptEditorHook();
}
