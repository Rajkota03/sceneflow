
import React from 'react';

interface ScriptEditorContentProps {
  className?: string;
  zoomPercentage?: number;
  onZoomChange?: (value: number[]) => void;
}

const ScriptEditorContent: React.FC<ScriptEditorContentProps> = ({
  className,
  zoomPercentage = 100,
}) => {
  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <div className="flex-grow overflow-auto p-4">
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">Screenplay editor content will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditorContent;
