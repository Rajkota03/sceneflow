
import React, { useMemo } from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptPage from './ScriptPage';
import { calculatePageNumber, LINES_PER_PAGE } from '@/lib/elementStyles';

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

  // Group elements into pages
  const pages = useMemo(() => {
    if (!elements) return [[]];
    
    const result = [];
    let currentPageElements = [];
    let currentLineCount = 0;
    
    for (const element of elements) {
      // Estimate lines based on element type and content
      let elementLines = Math.ceil(element.text.length / 60); // Approximate characters per line
      if (element.type === 'scene-heading') elementLines = 2;
      if (element.type === 'character') elementLines = 1;
      if (element.type === 'parenthetical') elementLines = 1;
      
      // Check if adding this element would exceed page limit
      if (currentLineCount + elementLines > LINES_PER_PAGE && currentPageElements.length > 0) {
        result.push([...currentPageElements]);
        currentPageElements = [];
        currentLineCount = 0;
      }
      
      currentPageElements.push(element);
      currentLineCount += elementLines;
    }
    
    // Add remaining elements
    if (currentPageElements.length > 0) {
      result.push(currentPageElements);
    }
    
    return result;
  }, [elements]);

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  return (
    <ScrollArea className="h-full w-full overflow-auto">
      <div 
        className="flex flex-col items-center w-full pt-8 pb-20 space-y-12"
        ref={scriptContentRef}
      >
        {pages.map((pageElements, pageIndex) => (
          <div key={pageIndex} className="w-full max-w-4xl mx-auto">
            <ScriptPage
              elements={pageElements}
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
              currentPage={pageIndex + 1}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ScriptContent;
