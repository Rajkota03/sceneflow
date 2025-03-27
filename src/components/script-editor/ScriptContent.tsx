
import React from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
import { useScriptEditor } from './ScriptEditorProvider';
import SlateEditor from './SlateEditor';

const ScriptContent: React.FC = () => {
  const { formatState } = useFormat();
  const {
    elements,
    setElements,
    beatMode,
    selectedStructure,
    scriptContentRef,
  } = useScriptEditor();

  const handleContentChange = (newElements: any[]) => {
    // Important: update the elements in the context
    setElements(newElements);
  };

  return (
    <ScrollArea className="h-full w-full overflow-auto">
      <div 
        className="flex flex-col items-center w-full pt-8 pb-20"
        ref={scriptContentRef}
      >
        <div className="w-full max-w-4xl mx-auto">
          <SlateEditor 
            elements={elements}
            onChange={handleContentChange}
            formatState={formatState}
            beatMode={beatMode}
            selectedStructure={selectedStructure}
            className="min-h-[1056px]"
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default ScriptContent;
