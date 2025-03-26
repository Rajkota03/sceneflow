
import React from 'react';
import { ScriptElement, ElementType, Structure } from '@/lib/types';
import EditorElement from '../EditorElement';
import { ActionElement, DialogueElement } from '../script-elements';
import { BeatMode } from '@/types/scriptTypes';
import { FormatState } from '@/lib/formatContext';
import { getScriptPageStyles, getPageContentStyles } from '@/lib/elementStyles';
import { useScriptEditor } from './ScriptEditorProvider';

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
  const { showKeyboardShortcuts, handleBeatTag: contextHandleBeatTag } = useScriptEditor();
  
  const scriptPageStyles = getScriptPageStyles();
  const pageContentStyles = getPageContentStyles();

  // Function to handle beat tagging, using either the prop or context
  const handleBeatTagging = (elementId: string, beatId: string, actId: string) => {
    if (onBeatTag) {
      onBeatTag(elementId, beatId, actId);
    } else if (contextHandleBeatTag) {
      contextHandleBeatTag(elementId, beatId, actId);
    }
  };

  const renderElement = (element: ScriptElement, index: number) => {
    const isActive = activeElementId === element.id;
    const previousElementType = getPreviousElementType(index - 1);
    
    switch (element.type) {
      case 'action':
        return (
          <ActionElement
            key={element.id}
            element={element}
            previousElementType={previousElementType}
            onChange={handleElementChange}
            onFocus={() => handleFocus(element.id)}
            isActive={isActive}
            onNavigate={handleNavigate}
            onEnterKey={handleEnterKey}
            onFormatChange={handleFormatChange}
            showKeyboardShortcuts={showKeyboardShortcuts}
          />
        );
      case 'dialogue':
        return (
          <DialogueElement
            key={element.id}
            element={element}
            previousElementType={previousElementType}
            onChange={handleElementChange}
            onFocus={() => handleFocus(element.id)}
            isActive={isActive}
            onNavigate={handleNavigate}
            onEnterKey={handleEnterKey}
            onFormatChange={handleFormatChange}
            showKeyboardShortcuts={showKeyboardShortcuts}
          />
        );
      default:
        return (
          <EditorElement
            key={element.id}
            element={element}
            previousElementType={previousElementType}
            onChange={handleElementChange}
            onFocus={() => handleFocus(element.id)}
            isActive={isActive}
            onNavigate={handleNavigate}
            onEnterKey={handleEnterKey}
            onFormatChange={handleFormatChange}
            onTagsChange={handleTagsChange}
            characterNames={characterNames}
            projectId={projectId}
            beatMode={beatMode}
            selectedStructure={selectedStructure}
            onBeatTag={handleBeatTagging}
          />
        );
    }
  };

  return (
    <div className="script-page relative" style={scriptPageStyles}>
      <div 
        className="absolute top-4 w-full text-center"
        style={{
          fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
          fontSize: '12pt',
        }}
      >
        {currentPage}
      </div>

      <div className="script-page-content" style={pageContentStyles}>
        {elements.map((element, index) => renderElement(element, index))}
      </div>
    </div>
  );
};

export default ScriptPage;
