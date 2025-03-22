
import React, { useEffect, useRef } from 'react';
import { ElementType, ScriptElement, Structure } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import { BeatMode } from '@/types/scriptTypes';
import { renderStyle, getElementStyles } from '@/lib/elementStyles';
import ElementTypeMenu from './editor/ElementTypeMenu';
import useElementInteraction from '@/hooks/useElementInteraction';
import { formatType } from '@/lib/formatScript';
import { useScriptEditor } from './script-editor/ScriptEditorProvider';
import BeatTagButton from './script/beat-tags/BeatTagButton';

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
  // Access global context for beat tagging and structure
  const contextValue = useScriptEditor ? useScriptEditor() : null;
  
  // Use the structure from props or context
  const structure = selectedStructure || (contextValue ? contextValue.selectedStructure : null);
  
  // Use onBeatTag from props or context
  const handleBeatTagging = onBeatTag || (contextValue ? contextValue.handleBeatTag : undefined);
  
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

  const elementStyles = getElementStyles(element.type);
  
  // Only show beat tagging controls for scene headings
  const showBeatTags = element.type === 'scene-heading' && beatMode === 'on';

  // If this element is active, force focus to the editor element
  useEffect(() => {
    if (isActive && editorRef.current) {
      // Set a timeout to ensure the focus happens after rendering
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          
          // Position cursor at the end
          const range = document.createRange();
          const selection = window.getSelection();
          
          if (editorRef.current.childNodes.length > 0) {
            const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
            range.setStartAfter(lastNode);
            range.collapse(true);
          } else {
            range.setStart(editorRef.current, 0);
            range.collapse(true);
          }
          
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 0);
    }
  }, [isActive]);

  return (
    <div 
      className={`element-container ${element.type} ${isActive ? 'active' : ''}`} 
      onContextMenu={handleRightClick}
    >
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
          ...elementStyles,
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext'
        }}
        dir="ltr"
        data-element-type={element.type}
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
          
          {showBeatTags && handleBeatTagging && (
            <div className="absolute right-0 top-0">
              <BeatTagButton
                elementId={element.id}
                beatId={element.beat}
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
