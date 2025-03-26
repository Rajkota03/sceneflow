
import React, { useEffect } from 'react';
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

  // Add focus effect to ensure the editor is responsive
  useEffect(() => {
    const editor = document.querySelector('.slate-editor');
    if (editor) {
      // Simulate click on mount to ensure focus
      setTimeout(() => {
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        editor.dispatchEvent(clickEvent);
      }, 200);
    }

    // Make sure the editor is visible in the viewport
    const scrollToVisibleElement = () => {
      const activeElement = document.querySelector('.active-element');
      if (activeElement && scriptContentRef.current) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Set a timer to scroll to the active element
    const timer = setTimeout(scrollToVisibleElement, 500);
    
    return () => clearTimeout(timer);
  }, [scriptContentRef]);

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
