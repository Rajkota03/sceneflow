
import React, { useEffect } from 'react';
import { ElementType, ScriptElement, Structure } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import SceneTags from './SceneTags';
import { BeatMode } from '@/types/scriptTypes';
import { renderStyle, getElementStyles } from '@/lib/elementStyles';
import ElementTypeMenu from './editor/ElementTypeMenu';
import useElementInteraction from '@/hooks/useElementInteraction';
import { formatType } from '@/lib/formatScript';

interface EditorElementProps {
  element: ScriptElement;
  previousElementType?: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  onTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const EditorElement: React.FC<EditorElementProps> = ({ 
  element, 
  previousElementType, 
  onChange, 
  onFocus, 
  isActive, 
  onNavigate, 
  onEnterKey, 
  onFormatChange, 
  onTagsChange,
  characterNames,
  projectId,
  beatMode = 'on',
  selectedStructure,
  onBeatTag
}) => {
  const {
    text,
    editorRef,
    suggestionsVisible,
    filteredSuggestions,
    focusIndex,
    showElementMenu,
    handleChange,
    handleKeyDown,
    handleSelectCharacter,
    handleRightClick,
    handleElementTypeChange,
    setShowElementMenu
  } = useElementInteraction({
    elementId: element.id,
    text: element.text,
    type: element.type,
    onChange,
    onNavigate,
    onEnterKey,
    onFormatChange,
    isActive,
    characterNames
  });

  useEffect(() => {
    if (element.type === 'scene-heading' && element.beat && selectedStructure) {
      console.log(`Scene ${element.id} has beat tag: ${element.beat}`);
    }
  }, [element, selectedStructure]);

  const elementStyles = getElementStyles(element.type);

  return (
    <div 
      className={`element-container ${element.type} ${isActive ? 'active' : ''} relative group`} 
      onContextMenu={handleRightClick}
    >
      <div className="absolute -left-16 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isActive && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <button
              onClick={() => setShowElementMenu(!showElementMenu)}
              className="px-1.5 py-0.5 text-blue-600 hover:bg-gray-100 rounded"
            >
              {formatType(element.type)}
            </button>
          </div>
        )}
      </div>
      
      <div
        ref={editorRef}
        className={`
          element-text 
          ${renderStyle(element.type, previousElementType)}
          ${isActive ? 'active-element' : ''}
        `}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={onFocus}
        onBlur={() => suggestionsVisible}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
          ...elementStyles
        }}
        dir="ltr"
      >
        {text}
      </div>
      
      {isActive && (
        <>
          {suggestionsVisible && (
            <CharacterSuggestions 
              suggestions={filteredSuggestions} 
              onSelect={handleSelectCharacter} 
              focusIndex={focusIndex}
            />
          )}
          
          {element.type === 'scene-heading' && beatMode === 'on' && (
            <div className="absolute right-0 top-0">
              <SceneTags 
                element={element} 
                onTagsChange={onTagsChange} 
                projectId={projectId}
                selectedStructure={selectedStructure}
                onBeatTag={onBeatTag}
              />
            </div>
          )}
          
          {showElementMenu && (
            <ElementTypeMenu 
              currentType={element.type} 
              onElementTypeChange={handleElementTypeChange} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default EditorElement;
