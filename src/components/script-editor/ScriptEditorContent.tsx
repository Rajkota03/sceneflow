
import React from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
import { useScriptEditor } from './ScriptEditorProvider';
import ZoomControls from './ZoomControls';
import TagManagerContainer from './TagManagerContainer';
import SlateEditor from './SlateEditor';
import { ElementType, ScriptElement } from '@/lib/types';

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
    handleElementChange,
    beatMode,
    selectedStructure,
    scriptContentRef,
    handleBeatTag
  } = useScriptEditor();

  // Handler for Slate editor content changes
  const handleSlateChange = (newElements: ScriptElement[] | any) => {
    // Check if newElements is an array (new API)
    if (newElements && Array.isArray(newElements)) {
      handleElementChange(newElements);
    } else {
      // Fallback for old API - need to provide all three required arguments
      console.log("Using fallback method for handleElementChange");
      const id = typeof newElements === 'string' ? newElements : '';
      const text = arguments[1] || '';
      const type = arguments[2] || 'action';
      handleElementChange(id, text, type as ElementType);
    }
  };

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      {/* Tag Manager container to filter elements by tag/act/beat */}
      <TagManagerContainer />
      
      <ScrollArea className="h-full w-full overflow-auto">
        <div 
          className="flex justify-center w-full pt-8 pb-20"
          ref={scriptContentRef}
        >
          <div className="w-full max-w-4xl mx-auto">
            {elements && elements.length > 0 ? (
              <SlateEditor
                elements={elements}
                onChange={handleSlateChange}
                formatState={formatState}
                beatMode={beatMode}
                selectedStructure={selectedStructure}
                className="mt-4"
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                Loading editor content... If this persists, please refresh the page.
              </div>
            )}
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
