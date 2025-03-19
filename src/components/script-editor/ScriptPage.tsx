
import React from 'react';
import { ScriptElement, ElementType, Structure } from '@/lib/types';
import EditorElement from '../EditorElement';
import { BeatMode } from '@/types/scriptTypes';
import { FormatState } from '@/lib/formatContext';
import FormatStyler from '../FormatStyler';

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
  formatState,
  currentPage,
  onBeatTag
}) => {
  // Calculate approx lines per page (based on Final Draft standard of ~54 lines/page)
  const linesPerPage = 54;
  
  // Get total line count estimate based on elements
  const getLineCount = (element: ScriptElement): number => {
    const text = element.text || '';
    const baseLines = Math.max(1, Math.ceil(text.length / 60)); // ~60 chars per line
    
    switch(element.type) {
      case 'scene-heading':
        return 1;
      case 'action':
        return baseLines;
      case 'character':
        return 1;
      case 'dialogue':
        return baseLines;
      case 'parenthetical':
        return 1;
      case 'transition':
        return 2; // 1 for transition + 1 for spacing
      default:
        return baseLines;
    }
  };
  
  // Calculate approx page and add page breaks as needed
  const totalLines = elements.reduce((acc, element) => acc + getLineCount(element), 0);
  const estimatedPageCount = Math.max(1, Math.ceil(totalLines / linesPerPage));
  
  return (
    <FormatStyler currentPage={currentPage}>
      <div className="script-elements-container">
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
    </FormatStyler>
  );
};

export default ScriptPage;
