
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
      // When using the array API, we're directly updating the entire elements array
      handleElementChange(newElements, '', 'action');
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

