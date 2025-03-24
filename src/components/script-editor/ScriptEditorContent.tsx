
import React from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
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

  return (
    <div className="h-full w-full overflow-auto">
      <div 
        className="flex justify-center w-full pt-8 pb-20"
        ref={scriptContentRef}
        style={{ 
          minHeight: '100vh',
          width: '100%'
        }}
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
