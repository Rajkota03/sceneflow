
import React from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptPage from './ScriptPage';
import ZoomControls from './ZoomControls';
import TagManagerContainer from './TagManagerContainer';

interface ScriptEditorContentProps {
  className?: string;
  zoomPercentage?: number;
  onZoomChange?: (value: number[]) => void;
}

const ScriptEditorContent: React.FC<ScriptEditorContentProps> = ({
  className,
  zoomPercentage = 100,
  onZoomChange
}) => {
  const { formatState } = useFormat();
  const {
    elements,
    activeElementId,
    currentPage,
    getPreviousElementType,
    handleElementChange,
    setActiveElementId,
    handleNavigate,
    handleEnterKey,
    changeElementType,
    handleTagsChange,
    characterNames,
    projectId,
    beatMode,
    selectedStructure,
    scriptContentRef,
    handleBeatTag
  } = useScriptEditor();

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  // Handle click on empty areas of the editor
  const handleEditorAreaClick = (e: React.MouseEvent) => {
    // Only handle clicks directly on the container element, not its children
    if (e.target === e.currentTarget) {
      console.log("Editor area clicked");
      
      // Focus the active element or the first element if none is active
      if (activeElementId) {
        const activeEl = document.getElementById(activeElementId);
        if (activeEl) {
          console.log("Focusing active element:", activeElementId);
          activeEl.focus();
        }
      } else if (elements && elements.length > 0) {
        console.log("Focusing first element:", elements[0].id);
        setActiveElementId(elements[0].id);
        
        setTimeout(() => {
          const firstEl = document.getElementById(elements[0].id);
          if (firstEl) {
            firstEl.focus();
          }
        }, 0);
      }
    }
  };

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      {/* Tag Manager container to filter elements by tag/act/beat */}
      <TagManagerContainer />
      
      <ScrollArea className="h-full w-full overflow-auto">
        <div 
          className="flex justify-center w-full pt-8 pb-20 cursor-text" 
          ref={scriptContentRef}
          onClick={handleEditorAreaClick}
        >
          <div className="w-full max-w-4xl mx-auto cursor-text">
            <ScriptPage
              elements={elements || []}
              activeElementId={activeElementId}
              getPreviousElementType={getPreviousElementType}
              handleElementChange={(id, text, type) => handleElementChange(id, text, type)}
              handleFocus={handleFocus}
              handleNavigate={handleNavigate}
              handleEnterKey={handleEnterKey}
              handleFormatChange={changeElementType}
              handleTagsChange={handleTagsChange}
              characterNames={characterNames}
              projectId={projectId}
              beatMode={beatMode}
              selectedStructure={selectedStructure}
              formatState={formatState}
              currentPage={currentPage}
              onBeatTag={handleBeatTag}
            />
          </div>
        </div>
      </ScrollArea>
      
      {onZoomChange && (
        <ZoomControls 
          zoomPercentage={zoomPercentage}
          onZoomChange={onZoomChange}
        />
      )}
    </div>
  );
};

export default ScriptEditorContent;
