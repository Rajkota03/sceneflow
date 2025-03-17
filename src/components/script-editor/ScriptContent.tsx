
import React from 'react';
import { ScriptElement, ElementType, Structure } from '@/lib/types';
import ScriptPage from './ScriptPage';
import { BeatMode } from '@/types/scriptTypes';

export interface ScriptContentComponentProps {
  filteredElements: ScriptElement[];
  activeElementId: string;
  currentPage: number;
  getPreviousElementType: (index: number) => ElementType;
  handleElementChange: (id: string, text: string, type: ElementType) => void;
  handleFocus: (id: string) => void;
  handleNavigate: (direction: 'up' | 'down', id: string) => void;
  handleEnterKey: (id: string, shiftKey: boolean) => void;
  handleFormatChange: (id: string, newType: ElementType) => void;
  handleTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
  selectedStructure?: Structure | null; // Add selectedStructure prop
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const ScriptContentComponent: React.FC<ScriptContentComponentProps> = ({
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
  return (
    <div className="flex-1 overflow-y-auto relative">
      <ScriptPage
        elements={filteredElements}
        activeElementId={activeElementId}
        handleElementChange={handleElementChange}
        handleFocus={handleFocus}
        handleNavigate={handleNavigate}
        handleEnterKey={handleEnterKey}
        handleFormatChange={handleFormatChange}
        handleTagsChange={handleTagsChange}
        getPreviousElementType={getPreviousElementType}
        characterNames={characterNames}
        projectId={projectId}
        beatMode={beatMode}
        selectedStructure={selectedStructure}
        onBeatTag={onBeatTag}
      />
    </div>
  );
};

export default ScriptContentComponent;
