
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
  const { showKeyboardShortcuts } = useScriptEditor();
  
  // Create elements if none exist
  const displayElements = elements.length > 0 ? elements : [];
  
  const scriptPageStyles = getScriptPageStyles();
  const pageContentStyles = getPageContentStyles();

  // Render the appropriate element component based on type
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
        // Use the generic EditorElement for other types for now
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
            onBeatTag={onBeatTag}
          />
        );
    }
  };

  return (
    <div className="script-page" style={{ 
      ...scriptPageStyles,
      transform: `scale(${formatState?.zoomLevel || 1})`,
      transformOrigin: 'top center',
      transition: 'transform 0.2s ease-out',
    }}>
      <div className="script-page-content" style={{
        ...pageContentStyles,
        position: 'relative'
      }}>
        {/* Page number positioned inside the page */}
        <div className="page-number absolute top-4 right-12 text-gray-700 font-bold text-sm z-10" style={{
          fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
          fontSize: "12pt",
        }}>
          {currentPage}
        </div>
        
        {displayElements.map((element, index) => renderElement(element, index))}
      </div>
    </div>
  );
};

export default ScriptPage;
