
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'; // Added useCallback, useMemo
import { ScriptContent, ScriptElement, Note, ElementType, ActType } from '../lib/types';
import EditorElement from './EditorElement'; // Already memoized
import { generateUniqueId } from '../lib/formatScript';
import FormatStyler from './FormatStyler';
import { useFormat } from '@/lib/formatContext';
import TagManager from './TagManager';
import useScriptElements from '@/hooks/useScriptElements';
import useFilteredElements from '@/hooks/useFilteredElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useScriptNavigation from '@/hooks/useScriptNavigation';
// useKeyboardShortcuts is now handled globally in Editor.tsx
// import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'; 
import KeyboardShortcutsHelp from './script-editor/KeyboardShortcutsHelp'; // Keep for potential direct rendering
import ZoomControls from './script-editor/ZoomControls';
import { BeatMode } from '@/types/scriptTypes';
import { useScriptEditor } from './script-editor/ScriptEditorProvider'; // Import context

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
  const { formatState, setZoomLevel } = useFormat(); // Get setZoomLevel from context
  const { showKeyboardShortcuts } = useScriptEditor(); // Get help visibility from context

  const [currentPage, setCurrentPage] = useState(1); // TODO: Implement actual pagination logic
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // --- State Management Hooks ---
  const {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange, // Already memoized in useScriptElements
    getPreviousElementType, // Already memoized in useScriptElements
    changeElementType // Already memoized in useScriptElements
  } = useScriptElements(initialContent, onChange);

  const { handleNavigate, handleEnterKey } = useScriptNavigation({
    elements,
    setElements,
    activeElementId,
    setActiveElementId
  });

  // --- Memoized Derived State --- 
  const characterNames = useCharacterNames(elements); // This hook likely uses useMemo internally
  const filteredElements = useFilteredElements(elements, activeTagFilter, activeActFilter); // This hook likely uses useMemo internally

  // --- Initial Element Setup --- 
  useEffect(() => {
    if (!elements || elements.length === 0) {
      console.log("No elements found, creating default elements");
      const defaultElements: ScriptElement[] = [
        { id: generateUniqueId(), type: 'scene-heading', text: 'INT. SOMEWHERE - DAY' },
        { id: generateUniqueId(), type: 'action', text: 'Type your action here...' }
      ];
      setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
    }
    // Ensure an element is active if the list is not empty but activeElementId is null
    else if (elements.length > 0 && !activeElementId) {
       setActiveElementId(elements[0].id);
    }
  // Run only if elements array itself changes drastically or activeElementId becomes null
  }, [elements, activeElementId, setElements, setActiveElementId]); 

  // --- Memoized Callbacks --- 
  const handleFormatChange = useCallback((id: string, newType: ElementType) => {
    changeElementType(id, newType);
  }, [changeElementType]);

  const handleFocus = useCallback((id: string) => {
    // Only update state if the active element actually changes
    if (id !== activeElementId) {
        setActiveElementId(id);
    }
  }, [activeElementId, setActiveElementId]);

  const handleTagsChange = useCallback((elementId: string, tags: string[]) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, tags } : element
      )
    );
  }, [setElements]);

  const handleFilterByTag = useCallback((tag: string | null) => {
    setActiveTagFilter(tag);
    if (tag !== null) {
      setActiveActFilter(null); // Clear act filter when tag filter is applied
    }
  }, []);

  const handleFilterByAct = useCallback((act: ActType | null) => {
    setActiveActFilter(act);
     if (act !== null) {
         setActiveTagFilter(null); // Clear tag filter when act filter is applied
     }
  }, []);

  const handleZoomChange = useCallback((value: number[]) => {
    const newZoomLevel = value[0] / 100;
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  }, [setZoomLevel]);

  // --- Derived Values ---
  const zoomPercentage = useMemo(() => Math.round(formatState.zoomLevel * 100), [formatState.zoomLevel]);

  // --- Rendering --- 
  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <div 
        className="flex justify-center w-full h-full overflow-auto p-4" // Added padding
        ref={editorRef}
      >
        {/* Use w-full and max-w-screen-lg for better width control */} 
        <div className="w-full max-w-screen-lg mx-auto">
          {/* Tag manager with Act Bar */}
          <TagManager 
            scriptContent={{ elements }} // Pass elements directly
            onFilterByTag={handleFilterByTag}
            onFilterByAct={handleFilterByAct}
            activeFilter={activeTagFilter}
            activeActFilter={activeActFilter}
            projectName={projectName}
            structureName={structureName}
          />
          
          {/* Keyboard shortcut help is now rendered globally in Editor.tsx */} 
          {/* {showKeyboardShortcuts && <KeyboardShortcutsHelp />} */}
          
          {/* Apply zoom transform directly to the content container */}
          <div 
             className="script-page-container mt-4" 
             style={{
                 transform: `scale(${formatState.zoomLevel})`,
                 transformOrigin: 'top center',
                 transition: 'transform 0.2s ease-out',
             }}
          >
              {/* Render only the filtered elements */} 
              {/* TODO: Implement pagination logic here if needed */} 
              {/* For now, render all filtered elements in one flow */}
              <div className="script-page-content bg-white shadow-md p-12" style={{ // Simplified page styling
                  fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
                  fontSize: '12pt',
                  position: 'relative',
                  width: '8.5in', // Standard width
                  minHeight: '11in', // Standard height
                  margin: '0 auto', // Center the page
                  padding: '1in 1in 1in 1.5in' // Standard margins T R B L
              }}>
                  {/* Page number placeholder - needs real calculation */}
                  <div className="page-number absolute top-4 right-12 text-gray-500 text-xs" style={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
                      {currentPage}
                  </div>
                  
                  {filteredElements.map((element, index) => (
                      <EditorElement
                          key={element.id} // Key is crucial for performance
                          element={element}
                          // Pass previous element type from the *filtered* list
                          previousElementType={index > 0 ? filteredElements[index - 1].type : undefined}
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
        </div>
      </div>
      
      {/* Zoom Controls */}
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={handleZoomChange}
      />
    </div>
  );
};

export default ScriptEditor;

