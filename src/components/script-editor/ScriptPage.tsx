
import React from 'react';
import { ScriptElement, ElementType } from '@/lib/types';
import EditorElement from '../EditorElement';

// Define the BeatMode type to be consistent
type BeatMode = 'on' | 'off';

interface ScriptPageProps {
  elements: ScriptElement[];
  activeElementId: string | null;
  formatState: { zoomLevel: number };
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
  beatMode: BeatMode;
}

const ScriptPage: React.FC<ScriptPageProps> = ({
  elements,
  activeElementId,
  formatState,
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
  return (
    <div className="script-page" style={{ 
      transform: `scale(${formatState.zoomLevel})`,
      transformOrigin: 'top center',
      transition: 'transform 0.2s ease-out',
      fontFamily: '"Courier Final Draft", "Courier Prime", monospace'
    }}>
      <div className="script-page-content" style={{
        fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
        fontSize: '12pt',
        position: 'relative'
      }}>
        {/* Page number positioned inside the page */}
        <div className="page-number absolute top-4 right-12 text-gray-700 font-bold text-sm z-10" style={{
          fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
          fontSize: "12pt",
        }}>
          {currentPage}
        </div>
        
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
          />
        ))}
      </div>
    </div>
  );
};

export default ScriptPage;
