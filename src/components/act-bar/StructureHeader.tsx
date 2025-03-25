
import React from 'react';
import { Button } from '../ui/button';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';

interface StructureHeaderProps {
  title?: string;
}

const StructureHeader: React.FC<StructureHeaderProps> = ({ title }) => {
  const { selectedStructure, beatMode, onToggleBeatMode } = useScriptEditor();
  
  // Use the provided title, or fall back to the selected structure's name, or a default
  const displayTitle = title || (selectedStructure?.name || "Story Structure");
  
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <h3 className="text-sm font-medium mr-2 text-gray-700 dark:text-gray-300">
          {displayTitle}
        </h3>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400"
        onClick={() => onToggleBeatMode && onToggleBeatMode(beatMode === 'on' ? 'off' : 'on')}
      >
        {beatMode === 'on' ? 'Free Mode' : 'Beat Mode'}
      </Button>
    </div>
  );
};

export default StructureHeader;
