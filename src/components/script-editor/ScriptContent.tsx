
import React from 'react';
import { ScriptElement, ElementType, ActType } from '@/lib/types';
import FormatStyler from '../FormatStyler';
import ScriptPage from './ScriptPage';
import { useFormat } from '@/lib/formatContext';

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
  beatMode: 'on' | 'off';
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
  beatMode
}) => {
  const { formatState } = useFormat();

  return (
    <div className="flex justify-center w-full h-full overflow-auto">
      <div className="w-full max-w-4xl mx-auto">
        <FormatStyler currentPage={currentPage}>
          <ScriptPage 
            elements={filteredElements}
            activeElementId={activeElementId}
            formatState={formatState}
            currentPage={currentPage}
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
          />
        </FormatStyler>
      </div>
    </div>
  );
};

export default ScriptContent;
