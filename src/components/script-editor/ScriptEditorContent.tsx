
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
  const handleSlateChange = (newElements: ScriptElement[] | string, text?: string, type?: ElementType) => {
    // Check if newElements is an array (new API)
    if (Array.isArray(newElements)) {
      // When using the array API, we need to call onChange directly
      // instead of using handleElementChange since it expects different parameters
      onChange(newElements);
    } else if (typeof newElements === 'string' && text !== undefined && type !== undefined) {
      // Old API with 3 parameters
      handleElementChange(newElements, text, type);
    } else {
      // Fallback with default values if parameters are incorrect
      console.log("Using fallback method for handleElementChange");
      const defaultId = typeof newElements === 'string' ? newElements : '';
      const defaultText = text || '';
      const defaultType = type || 'action';
      handleElementChange(defaultId, defaultText, defaultType as ElementType);
    }
  };

  // Direct handler for array updates from SlateEditor
  const onChange = (updatedElements: ScriptElement[]) => {
    if (Array.isArray(updatedElements)) {
      // We need to handle the array update differently
      // Since handleElementChange expects a string ID and other parameters
      // Here we just want to update the entire elements array
      console.log("Updating entire elements array with", updatedElements.length, "elements");
      
      // Pass the first element's ID as a placeholder, but the actual update will use the array
      if (updatedElements.length > 0) {
        const firstElement = updatedElements[0];
        handleElementChange(firstElement.id, JSON.stringify(updatedElements), 'action');
      }
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
