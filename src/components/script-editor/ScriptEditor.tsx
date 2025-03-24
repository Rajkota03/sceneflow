
import { useEffect, useRef, useState } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType, ActType, Structure } from '@/lib/types';
import { generateUniqueId } from '@/lib/formatScript';
import FormatStyler from '../FormatStyler';
import { useFormat } from '@/lib/formatContext';
import TagManager from '../TagManager';
import useScriptElements from '@/hooks/useScriptElements';
import useFilteredElements from '@/hooks/useFilteredElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useScriptNavigation from '@/hooks/useScriptNavigation';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import ZoomControls from './ZoomControls';
import ScriptEditorProvider from './ScriptEditorProvider';
import ScriptEditorContent from './ScriptEditorContent';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectName?: string;
  structureName?: string;
  projectId?: string;
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  beatMode?: 'on' | 'off';
  onToggleBeatMode?: (mode: 'on' | 'off') => void;
}

const ScriptEditor = ({ 
  initialContent, 
  onChange, 
  notes, 
  onNoteCreate, 
  className,
  projectName = "Untitled Project",
  structureName = "Three Act Structure",
  projectId,
  onStructureChange,
  selectedStructureId,
  beatMode = 'on',
  onToggleBeatMode
}: ScriptEditorProps) => {
  const { formatState, setZoomLevel } = useFormat();
  const [currentPage, setCurrentPage] = useState(1);

  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  };

  return (
    <ScriptEditorProvider
      initialContent={initialContent}
      onChange={onChange}
      projectId={projectId}
      selectedStructureId={selectedStructureId}
      onStructureChange={onStructureChange}
      beatMode={beatMode}
      onToggleBeatMode={onToggleBeatMode}
    >
      <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
        <div className="flex justify-center w-full h-full overflow-auto">
          <div className="w-full">
            <ScriptEditorContent 
              zoomPercentage={zoomPercentage}
              onZoomChange={handleZoomChange}
            />
          </div>
        </div>
        
        <ZoomControls 
          zoomPercentage={zoomPercentage}
          onZoomChange={handleZoomChange}
        />
      </div>
    </ScriptEditorProvider>
  );
};

export default ScriptEditor;
