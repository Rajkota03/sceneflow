import React from 'react';
import { useFormat } from '@/lib/formatContext';
import { ScrollArea } from '../ui/scroll-area';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptPage from './ScriptPage';
import ZoomControls from './ZoomControls';
import TagManagerContainer from './TagManagerContainer';
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
  const {
    formatState
  } = useFormat();
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
    handleBeatTag
  } = useScriptEditor();
  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };
  return <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      {/* Tag Manager container to filter elements by tag/act/beat */}
      <TagManagerContainer />
      
      <ScrollArea className="h-full w-full overflow-auto">
        
      </ScrollArea>
      
      {onZoomChange && <ZoomControls zoomPercentage={zoomPercentage} onZoomChange={onZoomChange} />}
    </div>;
};
export default ScriptEditorContent;