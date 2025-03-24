
import React, { useState } from 'react';
import { ScriptElement, ElementType, Structure } from '@/lib/types';
import EditorElement from '../EditorElement';
import { BeatMode } from '@/types/scriptTypes';
import BeatTagSelector from './BeatTagSelector';
import SceneBeatTag from './SceneBeatTag';

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
  selectedStructure: Structure | null;
  onBeatTag: (elementId: string, beatId: string, actId: string) => void;
  onRemoveBeat?: (elementId: string) => void;
  formatState: any;
  currentPage: number;
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
  onRemoveBeat,
  formatState,
  currentPage
}) => {
  const [tagSelectorOpen, setTagSelectorOpen] = useState<string | null>(null);
  
  const handleSceneClick = (elementId: string) => {
    // Only allow tagging for scene headings and in beat mode
    const element = elements.find(el => el.id === elementId);
    if (beatMode === 'on' && element?.type === 'scene-heading') {
      setTagSelectorOpen(tagSelectorOpen === elementId ? null : elementId);
    }
  };
  
  const handleRemoveBeatTag = (elementId: string) => {
    if (onRemoveBeat) {
      onRemoveBeat(elementId);
    }
  };
  
  return (
    <div 
      className="script-page relative" 
      style={{ 
        width: '8.5in',
        margin: '0 auto',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        pointerEvents: 'auto', // Ensure clicks are captured
        transition: 'transform 0.2s ease-out',
        transform: `scale(${formatState.zoomLevel})`,
        transformOrigin: 'top center',
        fontFamily: 'Courier Final Draft, Courier Prime, monospace',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <div 
        className="script-page-content" 
        style={{
          fontFamily: 'Courier Final Draft, Courier Prime, monospace',
          fontSize: '12pt',
          position: 'relative',
          pointerEvents: 'auto', // Ensure clicks are captured
          minHeight: '11in', // Standard letter size height
          padding: '1in',
          paddingBottom: '1.5in', // Extra padding at bottom for visibility
        }}
      >
        {/* Page number positioned inside the page */}
        <div className="page-number absolute top-4 right-12 text-gray-700 font-bold text-sm z-10" style={{
          fontFamily: "Courier Final Draft, Courier Prime, monospace",
          fontSize: "12pt",
        }}>
          {currentPage}
        </div>
        
        {elements.map((element, index) => {
          const previousElementType = getPreviousElementType(
            index - 1
          );
          
          return (
            <div key={element.id} className="relative">
              {/* Scene Beat Tag Indicator - only for scene headings with beat tag */}
              {beatMode === 'on' && element.type === 'scene-heading' && element.beat && (
                <div className="absolute -left-24 top-1">
                  <SceneBeatTag 
                    beatId={element.beat}
                    structure={selectedStructure}
                    onClick={() => handleSceneClick(element.id)}
                  />
                </div>
              )}
              
              {/* Beat Tag Selector - only displays when opened for a specific scene */}
              {beatMode === 'on' && element.type === 'scene-heading' && tagSelectorOpen === element.id && (
                <div className="absolute right-2 top-0 z-50">
                  <BeatTagSelector
                    elementId={element.id}
                    isOpen={tagSelectorOpen === element.id}
                    onOpenChange={(open) => setTagSelectorOpen(open ? element.id : null)}
                    structure={selectedStructure}
                    activeBeatId={element.beat}
                    onBeatSelect={onBeatTag}
                    onRemoveBeat={handleRemoveBeatTag}
                  />
                </div>
              )}
              
              <EditorElement
                key={element.id}
                element={element}
                previousElementType={previousElementType}
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
                onAdditionalClick={
                  element.type === 'scene-heading' ? 
                  () => handleSceneClick(element.id) : 
                  undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScriptPage;
