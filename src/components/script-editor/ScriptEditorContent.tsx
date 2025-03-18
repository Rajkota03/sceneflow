
import React from 'react';
import TagManagerContainer from './TagManagerContainer';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import ScriptContent from './ScriptContent';
import ZoomControls from './ZoomControls';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';

interface ScriptEditorContentProps {
  className?: string;
  zoomPercentage: number;
  onZoomChange: (value: number[]) => void;
}

const ScriptEditorContent: React.FC<ScriptEditorContentProps> = ({
  className,
  zoomPercentage,
  onZoomChange
}) => {
  const { showKeyboardShortcuts } = useKeyboardShortcuts();

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <TagManagerContainer />
      
      {showKeyboardShortcuts && <KeyboardShortcutsHelp />}
      
      <div className="script-content-wrapper relative flex-grow h-full overflow-hidden">
        <ScriptContent />
      </div>
      
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={onZoomChange}
      />
    </div>
  );
};

export default ScriptEditorContent;
