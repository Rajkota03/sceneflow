
import React from 'react';
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
    handleTagsChange: onTagsChange,
    characterNames,
    projectId,
    beatMode,
    selectedStructure,
    scriptContentRef
  } = useScriptEditor();

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  return (
    <ScrollArea className="h-full w-full overflow-auto">
      <div 
        className="flex justify-center w-full pt-8 pb-20"
        ref={scriptContentRef}
      >
        <div className="w-full max-w-4xl mx-auto">
          <ScriptPage
            elements={elements || []}
            activeElementId={activeElementId}
            getPreviousElementType={getPreviousElementType}
            handleElementChange={handleElementChange}
            handleFocus={handleFocus}
            handleNavigate={handleNavigate}
            handleEnterKey={handleEnterKey}
            handleFormatChange={changeElementType}
            handleTagsChange={onTagsChange}
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
