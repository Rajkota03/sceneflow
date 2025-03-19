
import React, { useEffect, useRef } from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptPage from './ScriptPage';

const ScriptContent: React.FC = () => {
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
    scriptContentRef
  } = useScriptEditor();

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  // If there are no elements, create initial elements with placeholder text
  useEffect(() => {
    if (elements.length === 0) {
      // The provider should handle this, but we can add a check here too
      console.log("Script content: No elements found");
    }
  }, [elements]);

  return (
    <div 
      className="w-full h-full overflow-auto bg-white dark:bg-slate-800 cursor-text"
      style={{ position: 'relative' }}
    >
      <div 
        ref={scriptContentRef}
        className="min-h-full flex flex-col items-center pt-8 pb-20"
      >
        <div 
          className="w-full max-w-4xl mx-auto px-4"
          style={{ 
            transform: `scale(${formatState.zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
        >
          <ScriptPage
            elements={elements || []}
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
            formatState={formatState}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ScriptContent;
