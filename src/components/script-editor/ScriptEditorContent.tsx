
import React, { useRef } from 'react';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptContent from './ScriptContent';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Slider } from '@/components/ui/slider';
import { Search, ZoomIn, ZoomOut } from 'lucide-react';

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
  const { showKeyboardShortcuts } = useScriptEditor();
  const scriptContentRef = useRef<HTMLDivElement>(null);
  
  useKeyboardShortcuts({
    scriptContentRef
  });

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <div className="flex-grow overflow-auto p-4">
        <div 
          ref={scriptContentRef}
          className="relative flex justify-center min-h-full"
          style={{ 
            transform: `scale(${zoomPercentage / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease'
          }}
        >
          <ScriptContent />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ZoomOut size={16} />
        </button>
        
        <Slider
          defaultValue={[zoomPercentage]}
          min={50}
          max={200}
          step={10}
          className="w-32 mx-2"
          onValueChange={onZoomChange}
        />
        
        <button className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ZoomIn size={16} />
        </button>
        
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{zoomPercentage}%</span>
      </div>
      
      {showKeyboardShortcuts && <KeyboardShortcutsHelp />}
    </div>
  );
};

export default ScriptEditorContent;
