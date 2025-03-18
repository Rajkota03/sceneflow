
import React from 'react';
import { ScriptElement, ElementType, Structure } from '@/lib/types';
import EditorElement from '../EditorElement';
import { BeatMode } from '@/types/scriptTypes';

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
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
  formatState?: { zoomLevel: number };
  currentPage?: number;
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
  onBeatTag,
  formatState = { zoomLevel: 1 },
  currentPage = 1
}) => {
  return (
    <div className="script-page" style={{ 
      transform: `scale(${formatState.zoomLevel})`,
      transformOrigin: 'top center',
      transition: 'transform 0.2s ease-out',
      fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
      padding: '1in',
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
      width: '8.5in',
      minHeight: '11in',
      margin: '0 auto',
      position: 'relative'
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
            previousElementType={getPreviousElementType(index)}
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
