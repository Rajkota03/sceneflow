
import React from 'react';
import { ScriptElement, ElementType, Structure } from '@/lib/types';
import EditorElement from '../EditorElement';
import { BeatMode } from '@/types/scriptTypes';
import { FormatState } from '@/lib/formatContext';

interface ScriptPageProps {
  elements: ScriptElement[];
  activeElementId: string | null;
  getPreviousElementType: (index: number) => ElementType | undefined;
  handleElementChange: (id: string, text: string, type: ElementType) => void;
  handleFocus: (id: string) => void;
  handleNavigate: (direction: 'up' | 'down', id: string) => void;
  handleEnterKey: (id: string, shiftKey: boolean) => void;
  handleFormatChange: (id: string, newType: ElementType) => void;
  handleTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode: BeatMode;
  selectedStructure?: Structure | null;
  formatState?: FormatState;
  currentPage: number;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const ScriptPage: React.FC<ScriptPageProps> = ({ 
  elements,
  activeElementId, 
  getPreviousElementType,
  handleElementChange,
  handleFocus,
  handleNavigate,
  handleEnterKey,
  handleFormatChange,
  handleTagsChange,
  characterNames,
  projectId,
  beatMode,
  selectedStructure,
  currentPage,
  onBeatTag
}) => {
  return (
    <div className="script-container p-4">
      <div className="script-elements-container" dir="ltr">
        {elements.map((element, index) => (
          <EditorElement
            key={element.id}
            element={element}
            previousElementType={getPreviousElementType(index - 1)}
            onChange={handleElementChange}
            onFocus={() => handleFocus(element.id)}
            isActive={activeElementId === element.id}
            onNavigate={handleNavigate}
            onEnterKey={handleEnterKey}
            onFormatChange={handleFormatChange}
            onTagsChange={handleTagsChange}
            characterNames={characterNames}
            projectId={projectId}
            beatMode={beatMode}
            selectedStructure={selectedStructure}
            onBeatTag={onBeatTag}
          />
        ))}
      </div>
    </div>
  );
};

export default ScriptPage;
