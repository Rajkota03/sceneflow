
import React, { useEffect } from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptPage from './ScriptPage';
import { toast } from '../ui/use-toast';

const ScriptContent: React.FC = () => {
  const { formatState } = useFormat();
  const {
    elements,
    activeElementId,
    currentPage,
    getPreviousElementType,
    handleElementChange,
    setElements,
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

  // Ensure we have elements
  useEffect(() => {
    if ((!elements || elements.length === 0) && setElements) {
      console.log("ScriptContent: Initializing with default elements");
      setElements([
        {
          id: crypto.randomUUID(),
          type: 'scene-heading',
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: crypto.randomUUID(),
          type: 'action',
          text: 'Type your screenplay here...'
        }
      ]);
    }
  }, [elements, setElements]);

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  useEffect(() => {
    console.log("ScriptContent rendering with", elements?.length || 0, "elements");
  }, [elements]);

  if (!elements || elements.length === 0) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="p-4 text-center text-gray-500">
          Loading editor content... If this persists, please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full overflow-auto">
      <div 
        className="flex justify-center w-full pt-8 pb-20"
        ref={scriptContentRef}
      >
        <div className="w-full max-w-4xl mx-auto">
          <ScriptPage
            elements={elements}
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
    </ScrollArea>
  );
};

export default ScriptContent;
