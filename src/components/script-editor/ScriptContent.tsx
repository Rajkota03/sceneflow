
import React, { useEffect, useRef } from 'react';
import { useFormat } from '@/lib/formatContext';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptPage from './ScriptPage';
import { generateUniqueId } from '@/lib/formatScript';
import { ElementType } from '@/lib/types';
import { toast } from 'sonner';

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
    scriptContentRef,
    setElements
  } = useScriptEditor();

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  // If there are no elements, create initial elements with placeholder text
  useEffect(() => {
    if (elements.length === 0) {
      console.log("Creating default elements for empty script");
      const defaultElements = [
        {
          id: generateUniqueId(),
          type: 'scene-heading' as ElementType,
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: generateUniqueId(),
          type: 'action' as ElementType,
          text: 'Type your action here...'
        }
      ];
      
      // Set the new elements
      setElements(defaultElements);
      
      // Set the first element as active
      setTimeout(() => {
        setActiveElementId(defaultElements[0].id);
      }, 100);
    }
  }, [elements, setElements, setActiveElementId]);

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on the background (not an element), focus the last element
    if (e.target === e.currentTarget && elements.length > 0) {
      setActiveElementId(elements[elements.length - 1].id);
    }
  };

  return (
    <div 
      className="w-full h-full overflow-auto bg-white dark:bg-slate-800 cursor-text"
      onClick={handleEditorClick}
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
