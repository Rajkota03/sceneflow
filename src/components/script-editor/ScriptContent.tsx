
import React from 'react';
import { ScriptElement, ElementType, Structure } from '@/lib/types';
import { useFormat } from '@/lib/formatContext';
import EditorElement from '../EditorElement';
import { BeatMode } from '@/types/scriptTypes';
import ScriptPage from './ScriptPage';
import { ScrollArea } from '../ui/scroll-area';

interface ScriptContentProps {
  elements: ScriptElement[];
  activeElementId: string | null;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
  selectedStructure?: Structure | null;
  onElementChange: (id: string, text: string, type: ElementType) => void;
  onElementFocus: (id: string) => void;
  onElementNavigate: (direction: 'up' | 'down', id: string) => void;
  onElementEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  onTagsChange: (elementId: string, tags: string[]) => void;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const ScriptContent: React.FC<ScriptContentProps> = ({
  elements,
  activeElementId,
  characterNames,
  projectId,
  beatMode = 'on',
  selectedStructure,
  onElementChange,
  onElementFocus,
  onElementNavigate,
  onElementEnterKey,
  onFormatChange,
  onTagsChange,
  onBeatTag
}) => {
  const { formatState } = useFormat();
  const currentPage = 1; // Default to page 1

  // Function to get the previous element type
  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index <= 0) return undefined;
    return elements[index - 1].type;
  };

  // Add a class to the main container based on beat mode
  const beatModeClass = beatMode === 'off' ? 'beat-mode-off' : 'beat-mode-on';

  return (
    <ScrollArea className={`w-full h-full ${beatModeClass}`}>
      <div className="editor-container flex justify-center w-full">
        <div className="w-full max-w-4xl mx-auto pt-8 pb-20">
          <ScriptPage
            elements={elements}
            activeElementId={activeElementId}
            getPreviousElementType={getPreviousElementType}
            handleElementChange={onElementChange}
            handleFocus={onElementFocus}
            handleNavigate={onElementNavigate}
            handleEnterKey={onElementEnterKey}
            handleFormatChange={onFormatChange}
            handleTagsChange={onTagsChange}
            characterNames={characterNames}
            projectId={projectId}
            beatMode={beatMode}
            selectedStructure={selectedStructure}
            onBeatTag={onBeatTag}
            formatState={formatState}
            currentPage={currentPage}
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default ScriptContent;
