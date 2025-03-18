
import React from 'react';
import { ScriptElement, ElementType, Structure } from '@/lib/types';
import { useFormat } from '@/lib/formatContext';
import EditorElement from '../EditorElement';
import { BeatMode } from '@/types/scriptTypes';
import ScriptPage from './ScriptPage';
import { ScrollArea } from '../ui/scroll-area';

interface ScriptContentProps {
  filteredElements: ScriptElement[];
  activeElementId: string | null;
  currentPage: number;
  getPreviousElementType: (index: number) => ElementType | undefined;
  handleElementChange: (id: string, text: string, type: ElementType) => void;
  handleFocus: (id: string) => void;
  handleNavigate: (direction: 'up' | 'down', id: string) => void;
  handleEnterKey: (id: string, shiftKey: boolean) => void;
  handleFormatChange: (id: string, newType: ElementType) => void;
  handleTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const ScriptContent: React.FC<ScriptContentProps> = ({
  filteredElements,
  activeElementId,
  currentPage,
  getPreviousElementType,
  handleElementChange,
  handleFocus,
  handleNavigate,
  handleEnterKey,
  handleFormatChange,
  handleTagsChange,
  characterNames,
  projectId,
  beatMode = 'on',
  selectedStructure,
  onBeatTag
}) => {
  const { formatState } = useFormat();

  return (
    <ScrollArea className="h-full w-full overflow-auto">
      <div className="flex justify-center w-full pt-8 pb-20">
        <div className="w-full max-w-4xl mx-auto">
          <ScriptPage
            elements={filteredElements}
            activeElementId={activeElementId}
            getPreviousElementType={getPreviousElementType}
            handleElementChange={handleElementChange}
            handleFocus={handleFocus}
            handleNavigate={handleNavigate}
            handleEnterKey={handleEnterKey}
            handleFormatChange={handleFormatChange}
            handleTagsChange={handleTagsChange}
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
