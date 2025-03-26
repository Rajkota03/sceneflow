
import React, { useEffect } from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
import { useScriptEditor } from './ScriptEditorProvider';
import ZoomControls from './ZoomControls';
import TagManagerContainer from './TagManagerContainer';
import SlateEditor from './SlateEditor';
import { ElementType, ScriptElement } from '@/lib/types';
import { toast } from '../ui/use-toast';

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
    setElements,
    beatMode,
    selectedStructure,
    scriptContentRef,
    handleBeatTag
  } = useScriptEditor();

  // Handler for Slate editor content changes
  const handleSlateChange = (newElements: ScriptElement[] | string, text?: string, type?: ElementType) => {
    // Check if newElements is an array (new API)
    if (Array.isArray(newElements)) {
      // When using the array API, we need to process the full array update
      handleArrayUpdate(newElements);
    } else if (typeof newElements === 'string' && text !== undefined && type !== undefined) {
      // Old API with 3 parameters for single element updates
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

  // Handle full array updates from SlateEditor
  const handleArrayUpdate = (updatedElements: ScriptElement[]) => {
    console.log("Updating entire elements array with", updatedElements.length, "elements");
    
    if (updatedElements.length > 0) {
      // Use the setElements function directly from the context
      // This properly updates the entire elements array at once
      setElements(updatedElements);
    } else {
      console.warn("Received empty elements array");
      toast({
        description: "Warning: Empty script content received",
        variant: "destructive",
      });
    }
  };

  // Ensure we have at least default content if elements are empty
  useEffect(() => {
    if ((!elements || elements.length === 0) && setElements) {
      console.log("Initializing with default elements");
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
