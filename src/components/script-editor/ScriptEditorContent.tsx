
import React from 'react';
import { useFormat } from '@/lib/formatContext';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptPage from './ScriptPage';

interface ScriptEditorContentProps {
  className?: string;
  zoomPercentage: number;
  onZoomChange: (value: number[]) => void;
}

const ScriptEditorContent: React.FC<ScriptEditorContentProps> = ({ 
  className,
  zoomPercentage,
  onZoomChange
}) => {
  const { formatState } = useFormat();
  const {
    filteredElements,
    activeElementId,
    currentPage,
    getPreviousElementType,
    handleElementChange,
    handleFocus,
    handleNavigate,
    handleEnterKey,
    changeElementType,
    handleTagsChange,
    characterNames,
    projectId,
    beatMode,
    selectedStructure,
    handleBeatTag,
    handleRemoveBeat,
    scriptContentRef
  } = useScriptEditor();

  const handleContainerClick = (e: React.MouseEvent) => {
    console.log('Script content container clicked');
    // Allow clicks to properly propagate
    if (e.target === e.currentTarget) {
      // If clicking the container and not an element, we could focus the last element
      console.log('Direct container click - could focus last element');
    }
  };

  return (
    <div className="h-full w-full overflow-auto">
      <div 
        className="flex justify-center w-full pt-8 pb-20"
        ref={scriptContentRef}
        style={{ 
          minHeight: '100vh',
          width: '100%',
          pointerEvents: 'auto' // Ensure pointer events are enabled
        }}
        onClick={handleContainerClick}
      >
        <ScriptPage
          elements={filteredElements}
          activeElementId={activeElementId}
          getPreviousElementType={getPreviousElementType}
          handleElementChange={handleElementChange}
          handleFocus={handleFocus}
          handleNavigate={handleNavigate}
          handleEnterKey={handleEnterKey}
          handleFormatChange={changeElementType}
          handleTagsChange={handleTagsChange}
          characterNames={characterNames}
          projectId={projectId}
          beatMode={beatMode}
          selectedStructure={selectedStructure}
          onBeatTag={handleBeatTag}
          onRemoveBeat={handleRemoveBeat}
          formatState={formatState}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default ScriptEditorContent;
