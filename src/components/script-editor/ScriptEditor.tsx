
import React, { useState, useRef, useEffect } from 'react';
import { ScriptContent, ElementType, Structure } from '@/lib/types';
import { generateUniqueId } from '@/lib/formatScript';
import { useFormat } from '@/lib/formatContext';
import { BeatMode } from '@/types/scriptTypes';
import ScriptElementComponent from './ScriptElement';
import FormatStyler from '../FormatStyler';
import ZoomControls from './ZoomControls';
import TagManagerContainer from './TagManagerContainer';
import useScriptElements from '@/hooks/script-editor/useScriptElements';
import useFilteredElements from '@/hooks/useFilteredElements';
import useCharacterNames from '@/hooks/useCharacterNames';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  className?: string;
  projectId?: string;
  selectedStructureId?: string | null;
  onStructureChange?: (structureId: string) => void;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  initialContent,
  onChange,
  className = '',
  projectId,
  selectedStructureId,
  onStructureChange,
  beatMode = 'on',
  onToggleBeatMode
}) => {
  const { formatState, setZoomLevel } = useFormat();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  // Initialize script elements from the initial content
  const {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    addNewElement,
    changeElementType
  } = useScriptElements(initialContent, onChange);

  // Get a list of all character names used in the script
  const characterNames = useCharacterNames(elements);
  
  // Apply any tag filters to the elements
  const filteredElements = useFilteredElements(elements, activeTagFilter, null);

  useEffect(() => {
    // Create default elements if none exist
    if (!elements || elements.length === 0) {
      const defaultElements = [
        {
          id: generateUniqueId(),
          type: 'scene-heading' as ElementType,
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: generateUniqueId(),
          type: 'action' as ElementType,
          text: 'Start writing your screenplay...'
        }
      ];
      setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements, setElements, setActiveElementId]);

  // Handle enter key press
  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    const currentElement = elements[currentIndex];
    
    // Handle shift+enter for line breaks in dialogue
    if (shiftKey && currentElement.type === 'dialogue') {
      const updatedElements = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
    // Add a new element after the current one
    addNewElement(id);
  };

  // Handle keyboard navigation between elements
  const handleNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };

  // Handle focus setting to a specific element
  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  // Handle changing the formatting/type of an element
  const handleFormatChange = (id: string, newType: ElementType) => {
    changeElementType(id, newType);
  };

  // Handle tag filtering
  const handleFilterByTag = (tag: string | null) => {
    setActiveTagFilter(tag);
  };

  // Handle zoom level changes
  const handleZoomChange = (value: number[]) => {
    if (setZoomLevel) {
      setZoomLevel(value[0] / 100);
    }
  };

  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  return (
    <div className={`flex flex-col w-full h-full relative ${className}`}>
      {/* Tag Manager for tag filtering */}
      <TagManagerContainer 
        scriptContent={{ elements }} 
        onFilterByTag={handleFilterByTag}
        activeFilter={activeTagFilter}
        beatMode={beatMode}
        onToggleBeatMode={onToggleBeatMode}
        selectedStructureId={selectedStructureId}
        onStructureChange={onStructureChange}
      />
      
      {/* Main editor area */}
      <div 
        className="flex justify-center w-full h-full overflow-auto"
        ref={scriptContainerRef}
      >
        <div className="w-full max-w-4xl mx-auto">
          <FormatStyler currentPage={currentPage}>
            <div className="script-page" style={{ 
              transform: `scale(${formatState.zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out'
            }}>
              <div className="script-page-content">
                {/* Page number */}
                <div className="page-number absolute top-4 right-12 text-gray-700 font-bold text-sm z-10">
                  {currentPage}
                </div>
                
                {/* Map through the elements and render each one */}
                {filteredElements.map((element, index) => (
                  <ScriptElementComponent
                    key={element.id}
                    id={element.id}
                    text={element.text}
                    type={element.type}
                    previousElementType={getPreviousElementType(
                      activeTagFilter 
                        ? filteredElements.findIndex(el => el.id === element.id) - 1
                        : index - 1
                    )}
                    isActive={activeElementId === element.id}
                    characterNames={characterNames}
                    onChange={handleElementChange}
                    onFocus={() => handleFocus(element.id)}
                    onNavigate={handleNavigate}
                    onEnterKey={handleEnterKey}
                    onFormatChange={handleFormatChange}
                  />
                ))}
              </div>
            </div>
          </FormatStyler>
        </div>
      </div>
      
      {/* Zoom controls */}
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={handleZoomChange}
      />
    </div>
  );
};

export default ScriptEditor;
